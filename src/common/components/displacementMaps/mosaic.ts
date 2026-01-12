import { ComponentBaseType } from "../../types";
import { image, svgContent } from "./mosaicSVG";

interface MosaicType extends ComponentBaseType {
	imageUrl: string;
	size?: number;
}

export class Mosaic extends HTMLElement {
	constructor(props: MosaicType, style: any = {}) {
		super();

		const { id, imageUrl, size = 20, debug, onClick } = props;

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

		svg2.setAttribute("id", "svg-mosaic");
		svg2.setAttribute("data-run", "paused");
		svg2.setAttribute("xmlns", "http://www.w3.org/2000/svg");
		svg2.setAttribute("width", "100%");
		svg2.setAttribute("height", "100%");
		svg2.setAttribute("preserveAspectRatio", "xMinYMin meet");
		// svg2.setAttribute('viewBox', '0 0 600 600');
		svg2.innerHTML = svgContent.replace(image, imageUrl);
		svg2.style.position = "absolute";

		const composite = svg2.querySelector(
			"feComposite"
		) as SVGFECompositeElement;
		composite.setAttribute("width", `${size}`);
		composite.setAttribute("height", `${size}`);
		const morphology = svg2.querySelector(
			"feMorphology"
		) as SVGFEMorphologyElement;
		morphology.setAttribute("radius", `${size / 2}`);

		this.appendChild(svg2);

		this.addEventListener("click", () =>
			onClick("https://www.google.com/search?q=mosaic")
		);
	}
}

// declare the new web component to allow constructor instanciation
customElements.define("dm-mosaic", Mosaic);
