import { CssType } from "@/types";
import { CreativeProps } from "@/creative";
import { createDiv } from "@/utils/divMaker";
import { ImageDM } from "@/components/image";
import { isMobile, trackPixel } from "@/utils/helper";
import { INTERACTION_TYPE, Tracking } from "@/utils/tracking";
import { bounceIn, bounceOut, hotSpotBounce } from "@/animations";

export type HotSpotsType = (
	root: HTMLElement,
	creativeProps: CreativeProps,
	props: HotSpotProps
) => void;

export interface HotSpotProduct {
	clickUrl?: string; // redirection click url for the product (if any)
	productUrl: string; // product image url
	spotLeft: string; // css left position of the product hotspot
	spotTop: string; // css top position of the product hotspot
	cardLeft?: string; // css left position of the product card if different for each card
	cardTop?: string; // css top position of the product card if different for each card
	floodLight?: string; // floodlight pixel url to track the hotspot click
}

interface HotSpotProps {
	clickUrl: string; // redirection click url
	bgUrl: string; // creative background url
	hotSpotUrl: string; // hotspot image url
	products: HotSpotProduct[];
	cardStyle?: CssType; // css style to override the card style
	hotspotStyle?: CssType; // css style to override the hotspot style
	closeBtnStyle?: CssType; // css style to override the product card's close button style
}

interface Trio {
	hotspot: HTMLElement;
	card: HTMLElement;
	closeBtn: HTMLElement;
	floodLight?: string;
}

const defaultProps: Required<HotSpotProps> = {
	clickUrl: "https://www.dailymotion.fr",
	bgUrl: "",
	hotSpotUrl:
		"https://statics.dmcdn.net/d/devTools/assets/hotSpots/hotspot.png",
	products: [
		{
			clickUrl: "https://www.google.fr?q=product0",
			productUrl:
				"https://statics.dmcdn.net/d/devTools/assets/hotSpots/product0.png",
			spotLeft: "94%",
			spotTop: "33%",
			cardLeft: "66%",
			cardTop: "16%",
		},
	],
	cardStyle: {},
	hotspotStyle: {},
	closeBtnStyle: {},
};

export const hotSpotsTemplate: HotSpotsType = (
	root: HTMLElement,
	{ onClick }: CreativeProps,
	hotSpotProps: HotSpotProps
) => {
	const actualProps: Required<HotSpotProps> = {
		...defaultProps,
		...hotSpotProps,
	};

	const {
		clickUrl,
		bgUrl,
		products,
		cardStyle,
		hotspotStyle,
		closeBtnStyle,
		hotSpotUrl,
	} = actualProps;

	let startTrackingTime: Date | undefined;

	const bg = new ImageDM("bg-dm", bgUrl);
	bg.addEventListener("click", (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (clickUrl) {
			Tracking.sendTracker("bg", INTERACTION_TYPE.clickThrough, e);
			onClick(clickUrl);
		}
	});
	root.appendChild(bg);

	const isMobileDevice = isMobile();
	const trios: Trio[] = products.map((product, i) => {
		const hotspot = createDiv(`spot_${i}`, {
			position: "absolute",
			width: isMobileDevice ? "6%" : "4.5%",
			aspectRatio: "1/1",
			left: product.spotLeft,
			top: product.spotTop,
			backgroundImage: `url(${hotSpotUrl})`,
			backgroundSize: "contain",
			backgroundRepeat: "no-repeat",
			cursor: "pointer",
			pointerEvents: "auto",
			...hotspotStyle,
		});
		hotSpotBounce(hotspot, 1000, 250 * i);

		const card = createDiv(`card_${i}`, {
			position: "absolute",
			display: "none",
			width: "28%",
			height: "56%",
			left: product.cardLeft || "0%",
			top: product.cardTop || "0%",
			backgroundImage: `url(${product.productUrl})`,
			backgroundSize: "contain",
			backgroundRepeat: "no-repeat",
			zIndex: "10",
			cursor: "pointer",
			pointerEvents: "none",
			...cardStyle,
		});

		card.addEventListener("click", (e) => {
			e.stopImmediatePropagation();
			Tracking.sendTracker(`card-${i}`, INTERACTION_TYPE.clickThrough, e);
			onClick(product.clickUrl || clickUrl);
		});

		const closeBtn = createDiv(`close-btn_${i}`, {
			position: "absolute",
			top: "-3%",
			right: "-3%",
			width: "20%",
			height: "20%",
			cursor: "pointer",
			// backgroundColor: "red"
			...closeBtnStyle,
		});

		card.appendChild(closeBtn);
		root.appendChild(hotspot);
		root.appendChild(card);

		return {
			hotspot,
			card,
			closeBtn,
			floodLight: product.floodLight,
		};
	});

	trios.forEach((trio, i) => {
		const { hotspot, card, closeBtn } = trio;

		if (isMobileDevice) {
			hotspot.addEventListener("click", (e) => {
				e.stopImmediatePropagation();
				Tracking.sendTracker(`hotspot-${i}`, INTERACTION_TYPE.touch, e);
				startTrackingTime = new Date();
				displayCard(i, e);
			});
		} else {
			hotspot.addEventListener("mouseover", (e) => {
				Tracking.sendTracker(`hotspot-${i}`, INTERACTION_TYPE.over, e);
				startTrackingTime = new Date();
				displayCard(i, e);
			});
			card.addEventListener("mouseleave", (e) => hideCard(i, e));
		}

		closeBtn.addEventListener("click", (e) => {
			e.stopImmediatePropagation();
			hideCard(i, e);
		});
	});

	const displayCard = (i: number, e: MouseEvent | PointerEvent) => {
		trios.forEach((_, j) => hideCard(j, e, true));

		const { hotspot, card, floodLight } = trios[i];
		hotspot.style.pointerEvents = "none";
		hotspot.getAnimations()[0].pause();

		card.style.pointerEvents = "auto";
		card.style.display = "block";
		root.appendChild(card); // make sure that the card is above all other elements
		bounceIn(card, 700);

		if (floodLight) {
			trackPixel(floodLight);
		}
	};

	const hideCard = (
		i: number,
		e: MouseEvent | PointerEvent,
		instant = false
	) => {
		const { hotspot, card } = trios[i];

		// already hidden, no need to hide it again
		if (card.style.pointerEvents === "none") {
			return;
		}

		let trackingMessage;
		if (startTrackingTime) {
			const endTrackingTime = new Date();
			const cardDuration =
				(endTrackingTime.getTime() - startTrackingTime.getTime()) /
				1000;
			trackingMessage = `${cardDuration}`;
			startTrackingTime = undefined;
		}

		Tracking.sendTracker(
			`hotspot-${i}`,
			INTERACTION_TYPE.close,
			e,
			trackingMessage
		);
		hotspot.style.pointerEvents = "auto";
		hotspot.getAnimations()[0].play();

		card.style.pointerEvents = "none";
		if (instant) {
			card.style.display = "none";
		} else {
			bounceOut(card, 450);
		}
	};
};
