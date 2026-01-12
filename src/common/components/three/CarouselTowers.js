import * as THREE from "three";
// import { getClientXY } from '../utils/helper';
// import { BLACK } from '../../utils/consts';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const facesLeft = [];
const facesRight = [];
let currIdx = 0;
let targetIdx = 0;
let renderer, scene, camera;
let width, height;
let group;
let mouseX;
let deltaX = 0;
let rotationStrength = 1;
let rotationStrengthTarget = 1;
let W; // width of one of the 2 cubes
let H; // height of both cubes
let raf, timeoutId, intervalId;

const getClientXY = (evt, rect = { left: 0, top: 0 }) => {
	const x = evt.clientX - rect.left;
	const y = evt.clientY - rect.top;
	return { x, y };
};

export const setup = (root) => {
	width = root.getBoundingClientRect().width;
	height = root.getBoundingClientRect().height;

	//RENDERER
	renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
	renderer.setClearColor(0x000000, 0);

	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(width, height);

	root.appendChild(renderer.domElement);

	//CAMERA
	camera = new THREE.PerspectiveCamera(
		35,
		width / height,
		0.1, // closest
		3000 // farthest
	);
	camera.position.z = 130;
	const ang_rad = (camera.fov * Math.PI) / 180;
	const fov_y = camera.position.z * Math.tan(ang_rad / 2) * 2;
	W = Math.min((Math.round(fov_y * camera.aspect) / 2) * 0.8, 40);
	H = Math.round(fov_y) * 0.8;

	//SCENE
	scene = new THREE.Scene();
	// scene.background = new THREE.Color(BLACK);

	// new OrbitControls(camera, renderer.domElement);

	//LIGHTS
	const spotLight1 = new THREE.SpotLight(0xffffff, 0.55);
	spotLight1.position.z = 60;
	scene.add(spotLight1);
	const spotLight2 = new THREE.SpotLight(0xffffff, 0.55);
	spotLight2.position.x = 20;
	spotLight2.position.z = 60;
	scene.add(spotLight2);
	const light = new THREE.AmbientLight(0xffffff);
	scene.add(light);

	//
	addCube();

	document.body.addEventListener("mousedown", touchStart);
	document.body.addEventListener("touchstart", touchStart);
	document.body.addEventListener("mousemove", touchMove);
	document.body.addEventListener("touchmove", touchMove);
	document.body.addEventListener("mouseup", endDrag);
	document.body.addEventListener("touchend", endDrag);
	document.body.addEventListener("mouseleave", endDrag);
	document.addEventListener("keydown", onDocumentKeyDown);

	window.addEventListener("resize", onWindowResize);

	timeoutId = setTimeout(() => {
		targetIdx -= 1;
		intervalId = setInterval(() => (targetIdx -= 1), 2200);
	}, 2500);

	render();
};

const exit = () => {
	clearTimeout(timeoutId);
	clearInterval(intervalId);

	document.body.removeEventListener("mousedown", touchStart);
	document.body.removeEventListener("touchstart", touchStart);
	document.body.removeEventListener("mousemove", touchMove);
	document.body.removeEventListener("touchmove", touchMove);
	document.body.removeEventListener("mouseup", endDrag);
	document.body.removeEventListener("touchend", endDrag);
	document.body.removeEventListener("mouseleave", endDrag);
	document.removeEventListener("keydown", onDocumentKeyDown);
	window.removeEventListener("resize", onWindowResize);
	window.cancelAnimationFrame(raf);
};

const touchStart = (evt) => {
	resetTimers();
	mouseX = getClientXY(evt).x;
};

const touchMove = (evt) => {
	if (mouseX !== undefined) {
		resetTimers();
		const x = getClientXY(evt).x;
		deltaX = x - mouseX;
		mouseX = x;
		currIdx += deltaX * 0.004;
	}
};

const onDocumentKeyDown = (event) => {
	const keyCode = event.which;
	// left
	if (keyCode === 37) {
		resetTimers();
		targetIdx += 1;
		// right
	} else if (keyCode === 39) {
		resetTimers();
		targetIdx -= 1;
	}
};

const endDrag = () => {
	if (Math.abs(deltaX) > 5) {
		if (Math.abs(deltaX) > 15) {
			targetIdx = Math.round(currIdx + deltaX * 0.022);
		} else {
			targetIdx = deltaX > 0 ? Math.ceil(currIdx) : Math.floor(currIdx);
		}
	} else {
		targetIdx = Math.round(currIdx);
	}
	mouseX = undefined;
	deltaX = 0;
};

//
const onWindowResize = () => {
	width = window.innerWidth;
	height = window.innerHeight;
	camera.aspect = width / height;
	camera.updateProjectionMatrix();

	renderer.setSize(width, height);
};

const resetTimers = () => {
	clearTimeout(timeoutId);
	clearInterval(intervalId);
	rotationStrengthTarget = 0;
	timeoutId = setTimeout(() => (rotationStrengthTarget = 1), 2500);
};

const addCube = () => {
	const images = [
		"https://images.unsplash.com/photo-1512641406448-6574e777bec6?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MjB8fHNreXxlbnwwfHwwfA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
		"https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?ixid=MXwxMjA3fDB8MHxzZWFyY2h8N3x8bmF0dXJlfGVufDB8fDB8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
		"https://images.unsplash.com/photo-1586348943529-beaae6c28db9?ixid=MXwxMjA3fDB8MHxzZWFyY2h8NHx8bmF0dXJlfGVufDB8fDB8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
		"https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixid=MXwxMjA3fDB8MHxzZWFyY2h8Mnx8bmF0dXJlfGVufDB8fDB8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
		"https://source.unsplash.com/random?t=0",
		"https://source.unsplash.com/random?f=1",
		"https://source.unsplash.com/random?g=2",
		"https://source.unsplash.com/random?h=3",
	];

	group = new THREE.Group();
	scene.add(group);
	for (let i = 0; i < 4; i++) {
		const loader = new THREE.TextureLoader();
		loader.load(images[i], (tex) => addFace(i, tex));
	}
};

const addFace = (i, texture) => {
	console.log("addtexture: ", i, texture);
	// disable the need for a power of 2 width and height
	texture.minFilter = THREE.LinearFilter;

	const r = (Math.sqrt(2) * W) / 2;

	// MATERIAL
	const material = new THREE.MeshStandardMaterial({
		map: texture,
		side: THREE.DoubleSide,
		flatShading: true, // allows the light to interact with the material
		// wireframe: true,
		// color: 0x00ff00,
		// bumpMap: texture.clone(),
	});

	// loop through both cubes
	for (let k = 0; k < 2; k++) {
		// GEOMETRY
		const faceGeometry = new THREE.BufferGeometry();

		// VERTICES (position)
		let angle1 = Math.PI / 4 + (i * Math.PI) / 2 + Math.PI / 2;
		let angle2 = Math.PI / 4 + (i * Math.PI) / 2;
		if (k === 1 && i % 2 === 1) {
			angle1 += Math.PI;
			angle2 += Math.PI;
		}
		const x1 = r * Math.cos(angle1);
		const x2 = r * Math.cos(angle2);
		const z1 = r * Math.sin(angle1);
		const z2 = r * Math.sin(angle2);
		const vertices = new Float32Array([
			x1, // 0 BL
			-H / 2,
			z1,
			x2, // 1 BR
			-H / 2,
			z2,
			x2, // 2 TR
			H / 2,
			z2,
			x1, // 3 TL
			H / 2,
			z1,
		]);
		faceGeometry.setAttribute(
			"position",
			new THREE.BufferAttribute(vertices, 3)
		);
		// UV (texture mapping)
		const { naturalWidth: texW, naturalHeight: texH } = texture.image;
		const imageAspect = texH / texW;
		let a1 = 1;
		let a2 = 1;
		if (H / W > imageAspect) {
			a1 = imageAspect;
		} else {
			a2 = imageAspect;
		}

		let ux1 = k === 0 ? 0 : 0.5;
		let ux2 = k === 0 ? 0.5 : 1;
		let uy1 = 0;
		let uy2 = 1;
		if (imageAspect > W / H) {
			ux1 = k === 0 ? 0.5 - a1 / 4 : 0.5;
			ux2 = k === 0 ? 0.5 : 0.5 + a1 / 4;
		} else {
			uy1 = 0.5 - a2 / 2;
			uy2 = 0.5 + a2 / 2;
		}
		console.log(ux1, ux2, uy1, uy2);
		faceGeometry.setAttribute(
			"uv",
			new THREE.BufferAttribute(
				new Float32Array([ux1, uy1, ux2, uy1, ux2, uy2, ux1, uy2]), // same order as vertices: BL, BR, TR, TL
				2
			)
		);

		// INDICES
		// indices of the 2 triangles (BL+BR+TR, BL+TR+TL)
		faceGeometry.setIndex([0, 1, 2, 0, 2, 3]);

		// MESH
		const meshFace = new THREE.Mesh(faceGeometry, material);
		meshFace.position.z = -W / 2; // align the front face with the z=0 position
		(k === 0 ? facesLeft : facesRight).push(meshFace);
		group.add(meshFace);
	}
	// if (facesLeft.length === 4 && facesRight.length === 4) {
	//   setSketchIsLoading(false);
	// }
};

// const controls = new OrbitControls(camera, renderer.domElement);

// RENDER LOOP
const render = () => {
	if (mouseX === undefined) {
		currIdx += (targetIdx - currIdx) * 0.08;
		if (Math.abs(targetIdx - currIdx) < 0.001) {
			currIdx = targetIdx;
		}
	}

	const qqq = (Math.abs(currIdx % 1) * Math.PI) / 2 - Math.PI / 4;
	const dx = ((Math.sqrt(2) * W) / 2) * Math.cos(qqq);

	facesLeft.forEach((faceMesh) => {
		faceMesh.rotation.y = (-currIdx * Math.PI) / 2;
		faceMesh.position.x = -dx;
	});

	facesRight.forEach((faceMesh) => {
		faceMesh.rotation.y = (currIdx * Math.PI) / 2;
		faceMesh.position.x = +dx;
	});

	rotationStrength += (rotationStrengthTarget - rotationStrength) * 0.08;
	const time = new Date().getTime() * 0.001;
	group.rotation.x = 0.14 * rotationStrength * Math.cos(time);
	group.rotation.y = 0.34 * rotationStrength * Math.sin(time);

	renderer.render(scene, camera);

	raf = requestAnimationFrame(render);

	// console.log('render')
};

const data = { setup, exit };

export default data;
