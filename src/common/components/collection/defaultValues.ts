import {
	CssType,
	ComponentBaseType,
	defaultComponentValues,
} from "../../types";

export interface CollectionType extends ComponentBaseType {
	productUrls: string[]; // image elements
	clickUrls?: string[]; // product redirections
	floodlights?: string[]; // product floodlights
	startIndex?: number;
	autoPlay?: boolean;
	autoplayDelay?: number; // delay before the first autoplay, in seconds
	autoplayPeriod?: number; // time between each autoplay, in seconds
	arrows?: HTMLElement[];
	fadeObjects?: HTMLElement[][];
	styleProductFocused?: CssType;
	styleProductOutLeft?: CssType;
	styleProductOutRight?: CssType;
	styleProductInLeft?: CssType;
	styleProductInRight?: CssType;
	introAnimationProperties?: {
		delay: number;
		duration: number;
		easing: string;
		endDelay?: number;
	};
	outroAnimationProperties?: {
		delay: number;
		duration: number;
		easing: string;
		endDelay?: number;
	};
	isVertical?: boolean;
	isInteractive?: boolean;
	onIndexChange?: (
		newIndex: number,
		prevIndex?: number,
		isLeft?: boolean
	) => void; // callback used when the currentIndex is updated
}

export const defaultValuesCollection: Required<CollectionType> = {
	...defaultComponentValues,
	id: "collection-dm",
	onClick: () => console.log("click on collection"),
	onIndexChange: () => {},
	autoPlay: true,
	autoplayDelay: 3,
	autoplayPeriod: 1.5,
	productUrls: [
		"https://statics.dmcdn.net/d/devTools/assets/creatives/mizuno-shoes/mizuno-1.png",
		"https://statics.dmcdn.net/d/devTools/assets/creatives/mizuno-shoes/mizuno-2.png",
		"https://statics.dmcdn.net/d/devTools/assets/creatives/mizuno-shoes/mizuno-3.png",
		"https://statics.dmcdn.net/d/devTools/assets/creatives/mizuno-shoes/mizuno-4.png",
		"https://statics.dmcdn.net/d/devTools/assets/creatives/mizuno-shoes/mizuno-5.png",
		"https://statics.dmcdn.net/d/devTools/assets/creatives/mizuno-shoes/mizuno-6.png",
	],
	floodlights: [],
	styleProductFocused: {
		width: "100%",
		height: "100%",
		backgroundPosition: "center center",
		backgroundSize: "contain",
		backgroundRepeat: "no-repeat",
		left: "0%",
		top: "0%",
		opacity: "1",
		position: "absolute",
		rotate: "0deg",
	},
	styleProductOutLeft: { left: "-100%", opacity: "0", rotate: "-20deg" },
	styleProductOutRight: { left: "100%", opacity: "0", rotate: "20deg" },
	styleProductInLeft: { left: "-100%", opacity: "0", rotate: "10deg" },
	styleProductInRight: { left: "100%", opacity: "0", rotate: "-10deg" },
	introAnimationProperties: {
		delay: 300,
		duration: 400,
		easing: "cubic-bezier(.01,.58,.17,1)",
	},
	outroAnimationProperties: {
		delay: 0,
		duration: 400,
		easing: "cubic-bezier(.01,.58,.17,1)",
	},
	arrows: [],
	startIndex: 0,
	clickUrls: [],
	fadeObjects: [],
	isVertical: false,
	isInteractive: true,
};
