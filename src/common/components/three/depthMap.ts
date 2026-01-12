import * as THREE from "three";

import { ComponentBaseType } from "@/types";
import { BaseComponent } from "../BaseComponent";
import { getClientXY, map } from "@/utils/helper";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export interface DepthMapType extends ComponentBaseType {
	imageUrl: string;
	root?: HTMLElement;
	depthMapUrl: string;
	additionalUniforms?: any;
	window: Window;
}

const PLANE_H = 90;
const PLANE_DETAIL_H = 400;

const VERTEX_SHADER = `
	uniform vec2 uAmplitude;
	uniform vec2 uResolution;
	uniform sampler2D uDepthMapTexture;
	varying float toto;
	
	varying vec2 vUv;
	
	void main() {
		vec3 p = position;// x from -w/2 to w/2, y from -h/2 to h/2
		
		vUv = (uv - vec2(.5)) * uResolution + vec2(0.5);
		float offset = texture2D(uDepthMapTexture, vUv).r;
		offset *= 12.;
		offset = pow(offset, 14.);
		// offset = 2. * pow(offset, 3.);
		// p.x += uAmplitude.x * offset;
		// p.y += uAmplitude.y * offset;
		// p.z = offset * 1.;
		
		toto = offset;
		
		vec4 mvPosition = modelViewMatrix * vec4( p, 1.0 );
		gl_Position = projectionMatrix * mvPosition;
	}
`;

const FRAGMENT_SHADER = `
	varying vec2 vUv;
	varying float toto;
	uniform vec2 uAmplitude;

	uniform sampler2D uTexture;
	uniform sampler2D uDepthMapTexture;
	uniform float uWidth;
	uniform float uHeight;

	uniform vec4 uHideCoords;
	uniform vec4 uShowCoords;

	void main() {
		vec2 offset = texture2D(uDepthMapTexture, vUv).r * uAmplitude * .03;
		vec4 color = texture2D(uTexture, vUv + offset);
		float w = uWidth;
		float h = uHeight;
		
		// Elio
		if(gl_FragCoord.x > .025*w && gl_FragCoord.x < .6*w && gl_FragCoord.y < .74*h && gl_FragCoord.y > .17*h){
			// alpha = 0.;
		}
		
		float alphaHide = 1.;
		float uHideXmin = uHideCoords.x;
		float uHideXmax = uHideCoords.y;
		float uHideYmin = uHideCoords.z;
		float uHideYmax = uHideCoords.w;
		if(gl_FragCoord.x > uHideXmin * w && gl_FragCoord.x < uHideXmax * w && gl_FragCoord.y > uHideYmin * h && gl_FragCoord.y < uHideYmax * h){
			alphaHide = 0.;
		}
		
		float alphaShow = 0.;
		float uShowXmin = uShowCoords.x;
		float uShowXmax = uShowCoords.y;
		float uShowYmin = uShowCoords.z;
		float uShowYmax = uShowCoords.w;
		if(gl_FragCoord.x > uShowXmin * w && gl_FragCoord.x < uShowXmax * w && gl_FragCoord.y > uShowYmin * h && gl_FragCoord.y < uShowYmax * h){
			alphaShow = 1.;
		}

		float alpha = alphaShow * alphaHide;

		gl_FragColor = vec4( vec3(1.,0.,0.), 1. );
		gl_FragColor = vec4( color.rgb, 1. ) * alpha;
	}
`;

export class DepthMap extends BaseComponent {
	private renderer: THREE.WebGLRenderer;
	private scene: THREE.Scene;
	private camera: THREE.PerspectiveCamera;
	private canvas: HTMLCanvasElement;
	private mesh: THREE.Mesh;
	private width: number;
	private height: number;

	private amplitude = [0, 0]; // x and y amplitude of the depth map effect
	private target = [0, 0]; // smooth effect
	private mouseAngle = 0;
	private isUserInteracting = false;
	private timeoutId: number;
	private uniforms: any;
	private mouseElement: HTMLElement;

	constructor(private props: DepthMapType, styleProps: any = {}) {
		super(props, {
			position: "absolute",
			width: "100%",
			height: "100%",
			...styleProps,
			backgroundColor: "transparent",
			touchAction: "pinch-zoom",
		});
	}

	private init = () => {
		this.mouseElement = this.props.root || this;
		const { width, height } = this.getBoundingClientRect();
		this.width = width;
		this.height = height;

		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
		});

		this.canvas = this.renderer.domElement;
		this.canvas.width = Math.ceil(width);
		this.canvas.height = height;
		this.canvas.style.width = `${Math.ceil(width)}px`;
		this.canvas.style.height = `${height}px`;
		this.appendChild(this.canvas);

		this.renderer.setSize(this.width, this.height);
		this.renderer.setPixelRatio(this.props.window.devicePixelRatio ?? 1);

		this.camera = new THREE.PerspectiveCamera(40, width / height, 1, 10000);
		this.camera.position.z = 110;

		this.scene = new THREE.Scene();

		this.uniforms = {
			uAmplitude: { value: [...this.amplitude] },
			uWidth: { value: this.width * this.props.window.devicePixelRatio },
			uHeight: {
				value: this.height * this.props.window.devicePixelRatio,
			},
			uShowCoords: { value: [0, 1, 0, 1] },
			uHideCoords: { value: [0, 0, 0, 0] },
			...this.props.additionalUniforms,
		};

		console.log("this.uniforms: ", this.uniforms);

		[this.props.depthMapUrl, this.props.imageUrl].forEach((url, i) => {
			const img = new Image();
			img.crossOrigin = "anonymous";
			img.src = url;
			img.onload = (e) => this.prepareTexture(e.target, i === 0);
		});

		new OrbitControls(this.camera, this.renderer.domElement);
	};

	prepareTexture = (img: EventTarget | null, isDepthMap: boolean) => {
		if (!img) {
			return;
		}
		const { naturalWidth: imgW, naturalHeight: imgH } =
			img as HTMLImageElement;
		const imageAspect = imgH / imgW;
		let a1 = 1;
		let a2 = 1;
		if (this.height / this.width > imageAspect) {
			a1 = (this.width / this.height) * imageAspect;
		} else {
			a2 = this.height / this.width / imageAspect;
		}

		const texture = new THREE.Texture(img);
		texture.needsUpdate = true;

		this.uniforms[isDepthMap ? "uDepthMapTexture" : "uTexture"] = {
			value: texture,
		};
		this.uniforms.uResolution = {
			value: [a1, a2],
		};

		if (this.uniforms.uTexture && this.uniforms.uDepthMapTexture) {
			const geometry = new THREE.PlaneGeometry(
				(PLANE_H * this.width) / this.height,
				PLANE_H,
				(PLANE_DETAIL_H * this.width) / this.height,
				PLANE_DETAIL_H
			);

			const material = new THREE.ShaderMaterial({
				uniforms: this.uniforms,
				vertexShader: VERTEX_SHADER,
				fragmentShader: FRAGMENT_SHADER,
				side: THREE.DoubleSide,
				// wireframe: true,
			});

			this.mesh = new THREE.Mesh(geometry, material);
			this.scene.add(this.mesh);

			this.mouseElement.addEventListener("pointermove", (e) =>
				this.pointerMove(e)
			);
			this.props.window.addEventListener("resize", this.onWindowResize);

			this.render();
		}
	};

	// called when the HTMLElement is added to the document
	connectedCallback() {
		this.init();
	}

	onWindowResize = () => {
		const { width, height } = this.getBoundingClientRect();
		this.width = width;
		this.height = height;

		this.camera.updateProjectionMatrix();
		this.renderer.setSize(width, height);
		this.uniforms.uWidth.value =
			this.width * this.props.window.devicePixelRatio;
		this.uniforms.uHeight.value =
			this.height * this.props.window.devicePixelRatio;
		// this prevents canvas flickering
		this.renderer.render(this.scene, this.camera);
	};

	pointerMove = (e: PointerEvent) => {
		const { x, y } = getClientXY(e);
		const { width, height } = this.mouseElement.getBoundingClientRect();

		this.target[0] = map(x, 0, width, -1, 1);
		this.target[1] = map(y, 0, height, -1, 1);

		this.isUserInteracting = true;
		this.mouseAngle = Math.atan2(this.target[1], this.target[0]);

		this.props.window.clearTimeout(this.timeoutId);
		this.timeoutId = this.props.window.setTimeout(
			() => (this.isUserInteracting = false),
			1500
		);
	};

	private render = () => {
		this.renderer.render(this.scene, this.camera);

		if (!this.isUserInteracting) {
			this.target[0] = Math.cos(this.mouseAngle);
			this.target[1] = Math.sin(this.mouseAngle);
			this.mouseAngle += 0.025;
		}

		this.amplitude[0] += (this.target[0] - this.amplitude[0]) * 0.1;
		this.amplitude[1] += (this.target[1] - this.amplitude[1]) * 0.1;

		const translateMax = 1.42; // vertex translation amplitude
		this.uniforms.uAmplitude = {
			value: [
				map(this.amplitude[0], -1, 1, -translateMax, translateMax),
				map(this.amplitude[1], -1, 1, translateMax, -translateMax),
			],
		};

		const rotMax = 0.02; // rotation amplitude
		// this.mesh.rotation.x = map(this.amplitude[1], -1, 1, rotMax, -rotMax);
		// this.mesh.rotation.y = map(this.amplitude[0], -1, 1, rotMax, -rotMax);

		this.props.window.requestAnimationFrame(() => this.render());
	};
}

// declare the new web component to allow constructor instanciation
customElements.define("dm-depth-map", DepthMap);
