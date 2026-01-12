import { HORIZONTAL_ALIGN, VERTICAL_ALIGN } from "../../types";
import { IndexManagerType, defaultPropsIndexManager } from "../indexManager";

export interface CarouselBasicType extends IndexManagerType {
	unfocusedElementWidth?: number; // the width in percent, occupied by the unfocused elements
	unfocusedElementHeight?: number; // the height in percent, occupied by the unfocused elements
	focusedElementOpacity?: number; // the focused element's opacity
	unfocusedElementOpacity?: number; // the unfocused element's opacity
	gap?: number; // horizontal gap between elements, in percents
	verticalAlign?: VERTICAL_ALIGN; // vertical alignmenent, top, center or bottom
	horizontalAlign?: HORIZONTAL_ALIGN; // horizontal alignmenent, left, center or right
}

export const defaultValuesCarouselBasic: Required<CarouselBasicType> = {
	...defaultPropsIndexManager,
	id: "carousel-basic-dm",
	onClick: () => console.log("click on carousel"),
	productUrls: [
		"https://images.unsplash.com/photo-1696464795756-2d92a11c504f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwxM3x8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60",
		"https://images.unsplash.com/photo-1695496573688-3e0e8ac8657e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwyMHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60",
		"https://images.unsplash.com/photo-1695456261833-3794ab617deb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw0Mnx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60",
		"https://plus.unsplash.com/premium_photo-1694670200212-3122e7c5c9b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw2NHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60",
		"https://images.unsplash.com/photo-1695878026745-1d07d1088045?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw2N3x8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60",
	],
	clickUrls: [],
	unfocusedElementWidth: 40,
	unfocusedElementHeight: 40,
	focusedElementOpacity: 1,
	unfocusedElementOpacity: 0.6,
	gap: 2,
	horizontalAlign: HORIZONTAL_ALIGN.CENTER,
	verticalAlign: VERTICAL_ALIGN.CENTER,
};
