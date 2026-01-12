import { CreativeProps } from "@/creative";
import { createDiv } from "@/utils/divMaker";
import { ImageDM } from "@/components/image";
import { INTERACTION_TYPE, Tracking } from "@/utils/tracking";

export type FastImpactType = (
	root: HTMLElement,
	creativeProps: CreativeProps,
	props: FastImpactProps
) => void;

interface FastImpactProps {
	clickUrl: string; // redirection click url
	bgUrl: string; // background url, displayed after timeBeforeCta
	ctaWording1?: string; // wording during countdown
	ctaWording2?: string; // wording when the user can click
	countdownDuration?: number; // cta countdown duration, in milliseconds
	afterCtaDuration?: number; // time between the user clicked the cta, and the ad stop, in milliseconds
	ctaStyle?: Partial<CSSStyleDeclaration>; // css style to override the cta style
}

const defaultProps: Required<FastImpactProps> = {
	clickUrl: "https://www.dailymotion.fr",
	bgUrl: "https://statics.dmcdn.net/d/PRODUCTION/2023/Travel_Yelloh_Village_ArtisansBonheur_Interactive_FastImpact_2312_20s/assets/bg.png",
	ctaWording1: "Passer dans ",
	ctaWording2: "Passer vite ▸▸",
	afterCtaDuration: 3000,
	countdownDuration: 5000,
	ctaStyle: {},
};

export const fastImpactTemplate: FastImpactType = (
	root: HTMLElement,
	{ videoSlot, onClick, stopAd, setAdVolume }: CreativeProps,
	fastImpactProps: FastImpactProps
) => {
	const actualProps: Required<FastImpactProps> = {
		...defaultProps,
		...fastImpactProps,
	};

	const {
		clickUrl,
		bgUrl,
		ctaWording1,
		ctaWording2,
		countdownDuration,
		afterCtaDuration,
		ctaStyle,
	} = actualProps;

	let ctaElapsedTime = 0;
	let previousNow = performance.now();
	let isVideoPaused = true;

	root.addEventListener("click", (e) => {
		e.preventDefault();
		e.stopPropagation();

		Tracking.sendTracker("bg", INTERACTION_TYPE.click, e);

		onClick(clickUrl);
	});

	videoSlot.addEventListener("pause", () => (isVideoPaused = true));
	videoSlot.addEventListener("play", () => (isVideoPaused = false));

	const bg = new ImageDM("bg-dm", bgUrl, {
		pointerEvents: "none",
		opacity: "0",
		transition: "opacity .4s",
	});

	const cta = createDiv("cta-dm", {
		position: "absolute",
		width: "23%",
		height: "13%",
		backgroundColor: "rgba(0,0,0,.8)",
		cursor: "pointer",
		right: "2%",
		bottom: "26%",
		color: "white",
		textAlign: "center",
		lineHeight: "320%",
		borderRadius: "4px",
		fontSize: "2.2vi",
		fontFamily: "sans-serif",
		userSelect: "none",
		pointerEvents: "none",
		whiteSpace: "pre",
		...ctaStyle,
	});
	cta.innerHTML = "skip video";

	root.appendChild(cta);
	root.appendChild(bg);

	const intervaleId = setInterval(() => {
		const now = performance.now();
		if (isVideoPaused) {
			previousNow = now;
			return;
		}
		ctaElapsedTime += now - previousNow;

		const remainingSeconds = Math.floor(
			(countdownDuration - ctaElapsedTime) / 1000
		);
		previousNow = now;
		if (remainingSeconds >= 0) {
			cta.innerHTML = `${ctaWording1} ${remainingSeconds}`;
		} else {
			cta.innerHTML = ctaWording2;
			clearInterval(intervaleId);
			cta.style.pointerEvents = "auto";
			cta.addEventListener("click", (e) => skipVideo(e));
		}
	}, 100);

	const skipVideo = (e: MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setAdVolume(0);
		bg.style.opacity = "1";
		cta.style.pointerEvents = "none";
		setTimeout(() => stopAd(), afterCtaDuration);
	};
};
