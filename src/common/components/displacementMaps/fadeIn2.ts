import { map } from "../../utils/helper";
import { ComponentBaseType } from "../../types";
// import { displacementImage, image, svgContent } from './fadeInSVG';

interface FadeInType extends ComponentBaseType {
	parent: HTMLElement;
	displacementMapUrl?: string;
	imageUrl: string;
}

export class FadeIn extends HTMLElement {
	constructor(props: FadeInType, style: any = {}) {
		super();

		const { id, displacementMapUrl, imageUrl, parent, debug, onClick } =
			props;

		this.setAttribute("id", id);
		const actualStyle = {
			display: "block",
			position: "absolute",
			width: "80%",
			height: "80%",
			top: "20%",
			left: "20%",
			backgroundColor: debug ? "#00ff0088" : "unset",
			overflow: "hidden",

			...style,
		};

		for (const [key, value] of Object.entries(actualStyle)) {
			(this.style as any)[key] = value;
		}

		const svg2 = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"svg"
		);
		svg2.setAttribute("id", "svg-displacement-map");
		svg2.setAttribute("data-run", "paused");
		svg2.setAttribute("xmlns", "http://www.w3.org/2000/svg");
		svg2.setAttribute("width", "100%");
		svg2.setAttribute("height", "100%");
		svg2.setAttribute("preserveAspectRatio", "xMinYMin meet");
		// svg2.setAttribute('viewBox', '0 0 600 600');
		svg2.innerHTML = ""; //svgContent.replace(displacementImage, displacementMapUrl).replace(image, imageUrl);
		svg2.style.position = "absolute";
		svg2.style.width = "100%";
		svg2.style.height = "100%";
		svg2.style.left = "0";
		svg2.style.top = "0";

		const defs = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"defs"
		);

		const filter = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"filter"
		);
		filter.setAttribute("id", "distortion-filter");
		filter.setAttribute("x", "0");
		filter.setAttribute("y", "0");
		filter.setAttribute("width", "100%");
		filter.setAttribute("height", "100%");
		filter.setAttribute("filterUnits", "objectBoundingBox");
		filter.setAttribute("primitiveUnits", "userSpaceOnUse");
		filter.setAttribute("color-interpolation-filters", "sRGB");

		const feImage = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"feImage"
		);
		feImage.setAttribute("id", "displacement-image");
		feImage.setAttribute("href", displacementMapUrl as string);
		feImage.setAttribute("x", "-8%");
		feImage.setAttribute("y", "-8%");
		feImage.setAttribute("width", "74%");
		feImage.setAttribute("height", "74%");
		feImage.setAttribute("preserveAspectRatio", "xMidYMid slice");
		feImage.setAttribute("color-interpolation-filters", "sRGB");
		feImage.setAttribute("result", "distortionImage");

		const displacementMap = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"feDisplacementMap"
		);
		displacementMap.setAttribute("id", "displacement-map");
		displacementMap.setAttribute("xChannelSelector", "R");
		displacementMap.setAttribute("yChannelSelector", "B");
		displacementMap.setAttribute("in", "SourceGraphic");
		displacementMap.setAttribute("in2", "distortionImage");
		displacementMap.setAttribute("result", "displacedImage");
		displacementMap.setAttribute("color-interpolation-filters", "sRGB");
		displacementMap.setAttribute("scale", "219");

		const image = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"image"
		);
		image.setAttribute("id", "img-distorted");
		image.setAttribute("width", "100%");
		image.setAttribute("height", "100%");
		image.setAttribute("preserveAspectRatio", "xMidYMid slice");
		image.setAttribute("href", imageUrl);
		image.setAttribute("filter", "url(#distortion-filter)");

		filter.appendChild(feImage);
		filter.appendChild(displacementMap);
		// defs.appendChild(filter);
		svg2.appendChild(filter);
		svg2.appendChild(image);
		this.appendChild(svg2);

		console.log("svg2: ", svg2);

		const target = this;
		target.style.filter = "url(#distortion-filter)";

		let { width, height } = target.getBoundingClientRect(); // container width and height in pixels

		target.addEventListener("pointermove", (e) => updateWarping(e.offsetX));
		let x = 0;
		window.addEventListener("resize", () => {
			width = target.getBoundingClientRect().width;
			height = target.getBoundingClientRect().height;
			updateWarping(x);
		});

		const updateWarping = (mouseX: number) => {
			x = mouseX;
			console.log(
				"updateWarping: ",
				mouseX,
				target.getBoundingClientRect()
			);
			displacementMap.setAttribute(
				"scale",
				`${map(
					mouseX,
					0,
					target.getBoundingClientRect().width,
					300,
					0
				)}`
			);
			const filterWidth = map(mouseX, 0, width, 1 * width, 3 * width);
			const filterHeight = map(mouseX, 0, width, 1 * height, 3 * height);
			feImage.setAttribute("width", `${filterWidth}px`);
			feImage.setAttribute("height", `${filterHeight}px`);
			// feImage.setAttribute('x', `${(width - filterWidth) / 2}px`);
			// feImage.setAttribute('y', `${(height - filterHeight) / 2}px`);
		};

		updateWarping(0);

		this.addEventListener("click", () =>
			onClick("https://www.google.com/search?q=fadeIn2")
		);
	}
}

// declare the new web component to allow constructor instanciation
customElements.define("dm-fade-in", FadeIn);
