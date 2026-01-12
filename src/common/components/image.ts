import { CssType } from "@/types";

export const CACHE_QUERY = "?q=CACHE_QUERY";

export class ImageDM extends HTMLElement {
	constructor(id: string, imageUrl: string, style: CssType = {}) {
		super();

		this.setAttribute("id", id);

		const actualStyle: CssType = {
			display: "block",
			position: "absolute",
			backgroundPosition: "center",
			backgroundRepeat: "no-repeat",
			backgroundSize: "cover",
			width: "100%",
			height: "100%",
			left: "unset",
			top: "unset",
			right: "unset",
			bottom: "unset",
			borderRadius: "0px",
			opacity: "1",
			scale: "1",
			rotate: "0",
			backgroundColor: "unset",
			aspectRatio: "auto",

			backgroundImage: imageUrl && `url(${imageUrl}${CACHE_QUERY})`,
			...style,
		};

		for (const [key, value] of Object.entries(actualStyle)) {
			(this.style as any)[key] = value;
		}
	}
}

// declare the new web component to allow constructor instanciation
customElements.define("dm-image", ImageDM);
