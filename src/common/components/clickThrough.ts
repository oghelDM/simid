import { CssType } from "@/types";
import { ImageDM } from "./image";
import { trackPixel } from "@/utils/helper";
import { INTERACTION_TYPE, Tracking } from "@/utils/tracking";

export class ClickThrough extends ImageDM {
	constructor(
		id: string,
		imageUrl: string,
		clickUrl: string,
		onClick: (url: string) => void,
		style: CssType = {},
		floodlight?: string
	) {
		super(id, imageUrl, style);

		this.addEventListener("click", async (e) => {
			e.preventDefault();
			e.stopPropagation();
			floodlight && trackPixel(floodlight);
			await Tracking.sendTracker(id, INTERACTION_TYPE.clickThrough, e);
			onClick(clickUrl);
		});
	}
}

// declare the new web component to allow constructor instanciation
customElements.define("dm-click-through", ClickThrough);
