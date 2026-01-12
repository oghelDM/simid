import { trackPixel } from "@/utils/helper";
import { CssType, ComponentBaseType } from "../types";

export class BaseComponent extends HTMLElement {
	constructor(
		{ onClick, clickUrl, id, floodlight }: ComponentBaseType,
		style: CssType = {}
	) {
		super();

		for (const [key, value] of Object.entries(style)) {
			(this.style as any)[key] = value;
		}

		// The component can explicitely prevent a redirection, in the collection component for example.
		// This prevents from both product and component redirections to fire at the same time.
		this.addEventListener("click", (e) => {
			e.preventDefault();
			e.stopPropagation();
			clickUrl !== "" && onClick(clickUrl);
			floodlight && trackPixel(floodlight);
		});

		this.id = id;
	}
}
