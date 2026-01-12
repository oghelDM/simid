import { CssType } from "../types";
import { BaseComponent } from "./BaseComponent";

export class InsightTimer extends BaseComponent {
	constructor(style: CssType = {}) {
		super(
			{ clickUrl: "", id: "insight-timer", onClick: () => {} },
			{
				position: "absolute",
				left: "2%",
				bottom: "3%",
				color: "white",
				fontSize: "3vi",
				fontFamily: "sans-serif",
				zIndex: "9",
				...style,
			}
		);
	}
}

// declare the new web component to allow constructor instanciation
customElements.define("dm-insight-timer", InsightTimer);
