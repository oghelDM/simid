import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export class Model3d {
	public model: THREE.Group;
	public controls: OrbitControls;

	private renderer: any;
	private width: number;
	private height: number;
	private camera: any;
	private scene: any;

	constructor(
		private root: HTMLElement,
		modelUrl: string,
		scale = 1,
		x = 0,
		y = 0,
		z = 0
	) {
		this.width = root.getBoundingClientRect().width;
		this.height = root.getBoundingClientRect().height;

		//RENDERER
		this.renderer = new THREE.WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		this.renderer.setClearColor(0xff4444, 0);

		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.width, this.height);

		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1;
		this.renderer.shadowMap.enabled = true;

		root.appendChild(this.renderer.domElement);

		//CAMERA
		this.camera = new THREE.PerspectiveCamera(
			35,
			this.width / this.height,
			0.1, // closest
			3000 // farthest
		);
		this.camera.position.z = 100;

		this.controls = new OrbitControls(
			this.camera,
			this.renderer.domElement
		);

		//SCENE
		this.scene = new THREE.Scene();
		const environment = new RoomEnvironment();
		const pmremGenerator = new THREE.PMREMGenerator(this.renderer);

		this.scene.environment = pmremGenerator.fromScene(environment).texture;

		//LIGHTS
		// const light = new THREE.AmbientLight(0xffffff, 50);
		// scene.add(light);

		const spotLight1 = new THREE.SpotLight(0xffffff, 11222);
		spotLight1.position.z = -50;
		spotLight1.lookAt(0, 0, 0);
		this.scene.add(spotLight1);

		const loader = new GLTFLoader();
		// https://statics.dmcdn.net/d/devTools/assets/models_3d/luffy_hat.glb

		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath(
			"https://www.gstatic.com/draco/v1/decoders/"
		);
		loader.setDRACOLoader(dracoLoader);

		loader.load(
			modelUrl,
			async (gltf) => {
				this.model = gltf.scene;

				await this.renderer.compileAsync(
					this.model,
					this.camera,
					this.scene
				);

				this.model.scale.set(scale, scale, scale);
				this.model.position.set(x, y, z);

				this.scene.add(this.model);

				this.render();
			},
			undefined,
			(error) => {
				console.error(error);
			}
		);

		window.addEventListener("resize", this.onWindowResize);
	}

	private onWindowResize = () => {
		this.width = this.root.getBoundingClientRect().width;
		this.height = this.root.getBoundingClientRect().height;
		this.camera.aspect = this.width / this.height;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(this.width, this.height);
	};

	// RENDER LOOP
	private render = () => {
		this.renderer.render(this.scene, this.camera);

		this.controls.update();

		requestAnimationFrame(this.render);
	};
}
