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

		const btnContainer = new ImageDM("btnContainer", "", {
			display: "flex",
			flexDirection: "column",
			flexWrap: "wrap",
			gap: "12px",
			alignContent: "start",
		});
		root.appendChild(btnContainer);

		[
			{
				label: "pause",
				action: () => this.pauseAd(),
			},
			{
				label: "play",
				action: () => this.playAd(),
			},
			{
				label: "mute",
				action: () => this.mute(),
			},
			{
				label: "unmute",
				action: () => this.unmute(),
			},
			{
				label: "enter FS",
				action: () => this.requestFullscreen(),
			},
			{
				label: "exit FS",
				action: () => this.requestExitFullscreen(),
			},
		].forEach(({ label, action }) => {
			const btn = new ImageDM(`btn-${label}`, "", {
				width: "200px",
				height: "40px",
				cursor: "pointer",
				position: "relative",
				lineHeight: "40px",
				borderRadius: "8px",
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
			btnContainer.appendChild(btn);
		});
	}
}

const creative = new SimidDebug();
creative.ready();
