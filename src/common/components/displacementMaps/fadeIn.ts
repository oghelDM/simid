import { ComponentBaseType } from "../../types";
import { displacementImage, image, svgContent } from "./fadeInSVG";

interface FadeInType extends ComponentBaseType {
	displacementMapUrl?: string;
	imageUrl: string;
}

export class FadeIn extends HTMLElement {
	private scale: number = 0;
	private zoom: number = 1;
	private feDisplacementMap: SVGFEDisplacementMapElement;
	private feImage: SVGFEImageElement;

	constructor(props: FadeInType, style: any = {}) {
		super();

		const {
			id,
			displacementMapUrl = displacementImage,
			imageUrl,
			debug,
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
		svg2.setAttribute("id", "svg-displacement-map");
		svg2.setAttribute("xmlns", "http://www.w3.org/2000/svg");
		svg2.setAttribute("width", "100%");
		svg2.setAttribute("height", "100%");

		svg2.innerHTML = svgContent
			.replace(displacementImage, displacementMapUrl)
			.replace(image, imageUrl);
		svg2.style.position = "absolute";
		svg2.style.width = "100%";
		svg2.style.height = "100%";
		svg2.style.left = "0";
		svg2.style.top = "0";

		this.appendChild(svg2);

		this.feImage = svg2.querySelector("feImage") as SVGFEImageElement;
		this.feDisplacementMap = svg2.querySelector(
			"feDisplacementMap"
		) as SVGFEDisplacementMapElement;

		window.addEventListener("resize", () =>
			this.update(this.scale, this.zoom)
		);
		this.addEventListener("click", () =>
			onClick("https://www.google.com/search?q=fadeIn")
		);
	}

	// called when the HTMLElement is added to the document
	connectedCallback() {
		this.update(this.scale, this.zoom);
	}

	public update = (scale: number, zoom: number) => {
		this.scale = scale;
		this.zoom = zoom;
		const width = this.offsetWidth;
		const height = this.offsetHeight;
		const filterWidth = zoom * width;
		const filterHeight = zoom * height;
		this.feDisplacementMap.setAttribute("scale", `${scale}`);
		this.feImage.setAttribute("width", `${filterWidth}px`);
		this.feImage.setAttribute("height", `${filterHeight}px`);
		this.feImage.setAttribute("x", `${(width - filterWidth) / 2}px`);
		this.feImage.setAttribute("y", `${(height - filterHeight) / 2}px`);
	};
}

// declare the new web component to allow constructor instanciation
customElements.define("dm-fade-in", FadeIn);
