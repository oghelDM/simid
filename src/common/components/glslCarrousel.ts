import * as THREE from "three";

import { CssType } from "@/types";
import { CACHE_QUERY } from "./image";
import { keepSafe } from "@/utils/helper";
import { CreativeProps } from "@/creative";

const VERTEX_SHADER = `
  varying vec2 vUv;

  void main() {
    vec3 p = position;// x from -w to w, y from -h to h
    
    vec4 mvPosition = modelViewMatrix * vec4( p, 1.0 );
    gl_Position = projectionMatrix * mvPosition;

    vUv = uv;
  }
`;

export type GlslCarrouselPropsType = {
	window: Window;
	productUrls: string[];
	fragmentShader: string;
	additionalUniforms?: any;
	timeStep?: number;
	useVideo?: boolean;
	startIdx?: number;
};

export class GlslCarrousel extends HTMLElement {
	public currIdx: number;
	public material: THREE.ShaderMaterial;
	private renderer: THREE.WebGLRenderer;
	private scene: THREE.Scene;
	private camera: THREE.PerspectiveCamera;
	private canvas: HTMLCanvasElement;
	private nbTextures: number;
	private width: number;
	private height: number;
	private window: Window;

	private time = 1;
	private videoTimeoutId: number;
	private textures: THREE.Texture[];
	private texturesDisplacement: THREE.Texture[];
	private useVideo: boolean;

	public uniforms: any;
	public timeStep: number;

	constructor(
		private root: HTMLElement,
		private creativeProps: CreativeProps,
		props: GlslCarrouselPropsType,
		style: CssType
	) {
		super();

		for (const [key, value] of Object.entries(style)) {
			(this.style as any)[key] = value;
		}
		const {
			productUrls,
			fragmentShader,
			window,
			additionalUniforms,
			timeStep = 0.02,
			useVideo = true,
			startIdx = 0,
		} = props;

		this.window = window;
		this.timeStep = timeStep;
		this.useVideo = useVideo;

		const loader = new THREE.TextureLoader();
		this.textures = productUrls.map((url) =>
			loader.load(`${url}${CACHE_QUERY}`)
		);
		this.texturesDisplacement = productUrls.map((url) =>
			loader.load(`${url.replace("product", "texture")}${CACHE_QUERY}`)
		);

		this.nbTextures = productUrls.length + (useVideo ? 1 : 0); // the products + the video
		this.currIdx = useVideo ? this.nbTextures - 1 : startIdx; // default focus on the video

		const { width, height } = this.root.getBoundingClientRect();
		this.width = width;
		this.height = height;

		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
		});

		this.canvas = this.renderer.domElement;
		this.canvas.id = "canvas-threejs";
		this.canvas.width = Math.ceil(this.width);
		this.canvas.height = this.height;

		this.canvas.style.zIndex = "3";
		this.canvas.style.touchAction = "none";

		this.renderer.setSize(this.width, this.height);
		this.renderer.setPixelRatio(window.devicePixelRatio ?? 1);
		this.renderer.setClearColor(0x00ff00, 0.8);

		this.canvas.style.width = "100%";
		this.canvas.style.height = "100%";

		this.appendChild(this.canvas);

		const fov = 40;
		this.camera = new THREE.PerspectiveCamera(
			fov,
			width / height,
			1,
			10000
		);
		const z =
			height /
			(2 *
				// window.devicePixelRatio *
				Math.tan(((fov / 2) * Math.PI) / 180));
		this.camera.position.z = z;

		this.scene = new THREE.Scene();

		const geometry = new THREE.PlaneGeometry(width, height, 120, 120);

		const { videoSlot } = creativeProps;
		videoSlot.addEventListener("loadeddata", () => {
			let dummyVideoTexture = new THREE.TextureLoader().load("");
			if (useVideo) {
				this.textures.push(dummyVideoTexture);
			}
			this.uniforms = {
				uTime: { value: this.time },
				uTexture1: { value: this.textures[0] },
				uTexture2: { value: this.textures[this.currIdx] },
				uTextureVideo: { value: dummyVideoTexture },
				uTextureDisplacement1: { value: this.texturesDisplacement[0] },
				uTextureDisplacement2: {
					value: this.texturesDisplacement[this.currIdx],
				},
				uIntensity: { value: 0.5 },
				...additionalUniforms,
			};

			const video = videoSlot.cloneNode
				? (videoSlot.cloneNode() as HTMLVideoElement)
				: document.createElement("video");
			video.crossOrigin = "anonymous";
			video.muted = true;
			video.autoplay = false;
			// make sure both videos are synchronised
			video.addEventListener("loadedmetadata", () => {
				const videoTexture = new THREE.VideoTexture(video);
				if (useVideo) {
					this.textures[this.textures.length - 1] = videoTexture;
					video.currentTime = videoSlot.currentTime;
					this.uniforms.uTexture2.value = videoTexture;
					this.uniforms.uTexture2.needsUpdate = true;
				}
				this.uniforms.uTextureVideo.value = videoTexture;
				this.uniforms.uTextureVideo.needsUpdate = true;
			});
			video.src = videoSlot.src;
			videoSlot.addEventListener("play", () => {
				video.currentTime = videoSlot.currentTime;
				try {
					video.play();
				} catch (e) {
					console.log("error playing video 1: ", e);
				}
			});

			try {
				video.play();
			} catch (e) {
				console.log("error playing video 2: ", e);
			}

			videoSlot.addEventListener("pause", () => video.pause());

			this.material = new THREE.ShaderMaterial({
				uniforms: this.uniforms,
				vertexShader: VERTEX_SHADER,
				fragmentShader,
				side: THREE.DoubleSide,
			});

			const mesh = new THREE.Mesh(geometry, this.material);
			this.scene.add(mesh);

			window.addEventListener("resize", this.onWindowResize);

			this.render();
		});
	}

	public goToIndex = (index: number) => {
		this.gotoTexture(index);
	};

	public goToPrevious = () => {
		this.gotoTexture(this.currIdx - 1);
	};

	public goToNext = () => {
		this.gotoTexture(this.currIdx + 1);
	};

	public goToVideo = () => {
		this.gotoTexture(this.nbTextures - 1);
	};

	private gotoTexture = (nextIdx: number) => {
		const prevIdx = this.currIdx;
		nextIdx = keepSafe(nextIdx, this.nbTextures);

		this.time = 0;
		this.uniforms.uTexture1.value = this.textures[prevIdx];
		this.uniforms.uTexture2.value = this.textures[nextIdx];
		this.uniforms.uTextureDisplacement1.value =
			this.texturesDisplacement[prevIdx];
		this.uniforms.uTextureDisplacement2.value =
			this.texturesDisplacement[nextIdx];
		this.uniforms.uTime.value = this.time;
		this.uniforms.uTexture1.needsUpdate = true;
		this.uniforms.uTexture2.needsUpdate = true;
		this.uniforms.uTextureDisplacement1.needsUpdate = true;
		this.uniforms.uTextureDisplacement2.needsUpdate = true;
		this.uniforms.uTime.needsUpdate = true;

		if (this.useVideo) {
			if (nextIdx === this.nbTextures - 1) {
				this.window.clearTimeout(this.videoTimeoutId);
				this.creativeProps.toggleVideo(true);
			} else if (prevIdx === this.nbTextures - 1) {
				this.videoTimeoutId = this.window.setTimeout(
					() => this.creativeProps.toggleVideo(false),
					1000 / (this.timeStep * 60)
				);
			}
		}

		this.currIdx = nextIdx;
	};

	private onWindowResize = () => {
		const { width, height } = this.root.getBoundingClientRect();

		// this prevents an unexplained and unwanted resize with a size of 0x0 in adTester
		if (width === 0 || height === 0) {
			return;
		}

		this.width = width;
		this.height = height;

		// this prevents canvas flickering
		this.renderer.render(this.scene, this.camera);
	};

	private render = () => {
		this.renderer.render(this.scene, this.camera);

		this.time += this.timeStep;
		this.time = Math.min(this.time, 1);
		this.uniforms.uTime = { value: this.time };
		this.uniforms.uTime.needsUpdate = true;

		this.window.requestAnimationFrame(this.render);
	};
}

customElements.define("dm-glslcarrousel", GlslCarrousel);
