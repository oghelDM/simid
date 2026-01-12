import { ComponentBaseType } from "../../types";
import { image, svgContent } from "./waterFlowSVG";

interface WaterFlowType extends ComponentBaseType {
	imageUrl: string;
	scale?: number;
	size?: number; // in percent; make it bigger than 100 to cover the borders black patches
}

export class WaterFlow extends HTMLElement {
	constructor(props: WaterFlowType, style: any = {}) {
		super();

		const { id, imageUrl, scale = 180, size = 100, debug, onClick } = props;

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

		svg2.setAttribute("id", "svg-water-flow");
		svg2.setAttribute("xmlns", "http://www.w3.org/2000/svg");
		svg2.setAttribute("width", "100%");
		svg2.setAttribute("height", "100%");

		svg2.innerHTML = svgContent.replace(image, imageUrl);
		svg2.style.position = "absolute";
		svg2.style.width = `${size}%`;
		svg2.style.height = `${size}%`;
		svg2.style.left = `${(100 - size) / 2}%`;
		svg2.style.top = `${(100 - size) / 2}%`;
		const displacementMap = svg2.querySelector(
			"feDisplacementMap"
		) as SVGFEDisplacementMapElement;
		displacementMap.setAttribute("scale", `${scale}`);

		this.appendChild(svg2);

		this.addEventListener("click", () =>
			onClick("https://www.google.com/search?q=waterflow")
		);
	}
}

// declare the new web component to allow constructor instanciation
customElements.define("dm-water-flow", WaterFlow);
