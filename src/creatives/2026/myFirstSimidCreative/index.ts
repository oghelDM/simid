import { ImageDM } from "@/components/image";
import { BaseSimidCreative } from "@/simid/base_simid_creative";

console.log("hello3");

class SimidDebug extends BaseSimidCreative {
	constructor() {
		super(
			"https://statics.dmcdn.net/d/PRODUCTION/2025/Food_Drink_Nutripure_Gel_Interactive_Carousel_2506_CAMPAIGN_FR_40s/assets/",
		);

		console.log("hello");

		const root = document.getElementById("player-wrapper");

		if (!root) {
			return;
		}

		root.appendChild(
			new ImageDM("img", `${this.assetsPrefixUrl}bg.png`, {
				inset: "0 0 0 0",
			}),
		);

		[
			{
				label: "requestPause",
				action: () => this.pauseAd(),
			},
			{
				label: "requestPlay",
				action: () => this.playAd(),
			},
		].forEach(({ label, action }, i) => {
			const btn = new ImageDM(`btn-${label}`, "", {
				width: "200px",
				height: "40px",
				cursor: "pointer",
				top: `${12 + 44 * i}px`,
				left: "12px",
				lineHeight: "40px",
				borderRadius: "12px",
				textAlign: "center",
				backgroundColor: "crimson",
				outline: "1.5px solid white",
				color: "white",
			});
			btn.innerHTML = label;
			btn.addEventListener("click", (e) => {
				e.preventDefault();
				e.stopPropagation();
				console.log("click on button: ", label);
				action();
			});
			root.appendChild(btn);
		});
	}
}

const creative = new SimidDebug();
creative.ready();
