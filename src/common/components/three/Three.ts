import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let renderer: any, scene: any, camera: any, controls: OrbitControls;

export const setup = (root: HTMLElement) => {
	renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
	renderer.setClearColor(0x000000, 0);

	const { width, height } = root.getBoundingClientRect();
	renderer.setSize(width, height);
	root.appendChild(renderer.domElement);

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);

	controls = new OrbitControls(camera, renderer.domElement);

	const geometry = new THREE.BoxGeometry(40, 40, 40);
	const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
	const cube = new THREE.Mesh(geometry, material);
	scene.add(cube);

	//controls.update() must be called after any manual changes to the camera's transform
	camera.position.set(0, 20, 100);
	controls.update();

	animate();
};

const animate = () => {
	requestAnimationFrame(animate);

	// required if controls.enableDamping or controls.autoRotate are set to true
	controls.update();

	renderer.render(scene, camera);
};
