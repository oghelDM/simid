import { ImageDM } from "@/components/image";
import { Collection } from "@/components/collection";
import { ClickThrough } from "@/components/clickThrough";
import { BaseSimidCreative } from "@/simid/base_simid_creative";

console.log("hello3");

const clickUrl =
	"https://www.nutripure.fr/fr/info/616-lancement-gel-energetique?utm_source=dailymotion&utm_medium=display&utm_campaign=gel-endurance";
const clickUrls = [
	"https://www.nutripure.fr/fr/endurance/280-gel-energetique.html?utm_source=dailymotion&utm_medium=display&utm_campaign=gel-endurance",
	"https://www.nutripure.fr/fr/endurance/275-boisson-recuperation.html?utm_source=dailymotion&utm_medium=display&utm_campaign=gel-endurance",
	"https://www.nutripure.fr/fr/endurance/279-1311-pastille-hydratation.html?utm_source=dailymotion&utm_medium=display&utm_campaign=gel-endurance",
	"https://www.nutripure.fr/fr/endurance/278-boisson-energetique-60g.html?utm_source=dailymotion&utm_medium=display&utm_campaign=gel-endurance",
	"https://www.nutripure.fr/fr/endurance/193-950-barre-energetique.html#/281-barre_energetique_saveurs-fruits_rouges/284-barre_energetique_format-6_barres?utm_source=dailymotion&utm_medium=display&utm_campaign=gel-endurance",
];

class SimidCreative extends BaseSimidCreative {
	constructor() {
		super(
			"https://statics.dmcdn.net/d/PRODUCTION/2026/myFirstSimidCreative/assets/",
		);

		console.log("hello");

		const bg = new ClickThrough(
			"bg",
			`${this.assetsPrefixUrl}bg.png`,
			clickUrl,
			this.clickThru,
		);
		this.root.appendChild(bg);

		const arrows = ["left", "right"].map(
			(name, i) =>
				new ImageDM(`${name}-id`, `${this.assetsPrefixUrl}arrow.png`, {
					height: "10%",
					width: "auto",
					aspectRatio: "41 / 71",
					left: i == 0 ? "66%" : "unset",
					right: i == 0 ? "unset" : "1.3%",
					top: "49%",
					cursor: "pointer",
					transform: i === 1 ? "rotate(180deg)" : "",
					// backgroundColor: "rgba(255, 0, 0, .6)",
				}),
		);

		// Collection component
		const collection = new Collection(
			{
				id: "collection-DM",
				productUrls: clickUrls.map(
					(_, i) => `${this.assetsPrefixUrl}product_${i}.png`,
				),
				onClick: this.clickThru,
				clickUrl: clickUrl,
				clickUrls: clickUrls,
				arrows,
				debug: false,
				styleProductFocused: {
					width: "100%",
					height: "100%",
					backgroundPosition: "center center",
					backgroundSize: "contain",
					backgroundRepeat: "no-repeat",
					top: "0%",
					left: "0%",
					opacity: "1",
					scale: "1",
					position: "absolute",
				},
				styleProductOutLeft: {
					opacity: "0",
					left: "-2.5%",
				},
				styleProductOutRight: {
					opacity: "0",
					left: "2.5%",
				},
				styleProductInLeft: {
					opacity: "0",
					left: "-2.5%",
				},
				styleProductInRight: {
					opacity: "0",
					left: "2.5%",
				},
				introAnimationProperties: {
					delay: 50,
					duration: 200,
					easing: "ease-in-out",
				},
				outroAnimationProperties: {
					delay: 0,
					duration: 300,
					easing: "ease-in-out",
				},
			},
			{
				width: "35%",
				height: "54%",
				top: "19.5%",
				right: "0%",
				// backgroundColor: "rgba(255,0,0,.4)",
			},
		);
		this.root.appendChild(collection);

		arrows.forEach((arrow) => this.root.appendChild(arrow));

		const btnContainer = new ImageDM("btnContainer", "", {
			display: "flex",
			flexDirection: "column",
			flexWrap: "wrap",
			gap: "12px",
			alignContent: "start",
			padding: "20px",
			boxSizing: "border-box",
			pointerEvents: "none",
		});
		this.root.appendChild(btnContainer);

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
				pointerEvents: "auto",
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

const creative = new SimidCreative();
creative.ready();
