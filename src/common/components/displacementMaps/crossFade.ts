import { map } from "../../utils/helper";
import { ComponentBaseType } from "../../types";
import { displacementImage, image1, image2, svgContent } from "./crossFadeSVG";

interface CrossFadeType extends ComponentBaseType {
	parent: HTMLElement;
	displacementMapUrl?: string;
	image1Url?: string;
	image2Url?: string;
	onClick: (url?: string) => void;
}

export class CrossFade extends HTMLElement {
	constructor(props: CrossFadeType, style: any = {}) {
		super();

		const {
			id,
			displacementMapUrl,
			parent,
			debug,
			image1Url = image1,
			image2Url = image2,
			onClick,
		} = props;

		this.setAttribute("id", id);
		const actualStyle = {
			display: "block",
			position: "absolute",
			width: "100%",
			height: "100%",
			top: 0,
			left: 0,
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

		svg2.setAttribute("id", "svg-cross-fade");
		svg2.setAttribute("data-run", "paused");
		svg2.setAttribute("xmlns", "http://www.w3.org/2000/svg");
		svg2.setAttribute("width", "100%");
		svg2.setAttribute("height", "100%");
		svg2.setAttribute("preserveAspectRatio", "xMinYMin meet");

		svg2.innerHTML = svgContent
			.replace(displacementImage, displacementMapUrl as string)
			.replace(image1, image1Url)
			.replace(image2, image2Url);
		svg2.style.position = "absolute";
		svg2.style.width = "100%";
		svg2.style.height = "100%";
		svg2.style.left = "0";
		svg2.style.top = "0";

		this.appendChild(svg2);

		let x = 0;
		const displacementMap = svg2.querySelector(
			"feDisplacementMap"
		) as SVGFEDisplacementMapElement;
		const filterImage = svg2.querySelector("feImage") as SVGFEImageElement;
		const composite = svg2.querySelector(
			"feComposite"
		) as SVGFECompositeElement;
		let { width, height } = parent.getBoundingClientRect(); // container width and height in pixels

		parent.addEventListener("pointermove", (e) => updateWarping(e.offsetX));
		window.addEventListener("resize", () => {
			const parentBoundingRect = parent.getBoundingClientRect();
			width = parentBoundingRect.width;
			height = parentBoundingRect.height;
			updateWarping(x);
		});

		const updateWarping = (mouseX: number) => {
			x = mouseX;
			const scale = Math.sin(map(mouseX, 0, width, 0, Math.PI)) * 210;
			displacementMap.setAttribute("scale", `${scale}`); //'200'); //
			const filterWidth = width; //map(mouseX, 0, width, width, 3 * width);
			const filterHeight = height; //map(mouseX, 0, width, height, 3 * height);
			filterImage.setAttribute("width", `${filterWidth}px`);
			filterImage.setAttribute("height", `${filterHeight}px`);
			filterImage.setAttribute("x", `${width / 2 - filterWidth / 2}px`);
			filterImage.setAttribute("y", `${height / 2 - filterHeight / 2}px`);
			composite.setAttribute("k2", `${map(mouseX, 0, width, 0, 1)}`);
			composite.setAttribute("k3", `${map(mouseX, 0, width, 1, 0)}`);
		};

		updateWarping(0);

		this.addEventListener("click", () => onClick());
	}
}

// declare the new web component to allow constructor instanciation
customElements.define("dm-cross-fade", CrossFade);
