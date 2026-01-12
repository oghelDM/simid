// import { VPAIDVideoPlayer } from "@app";

declare global {
	interface Window {
		// getVPAIDAd: () => VPAIDVideoPlayer;
		FontFace: {
			new (
				family: string,
				source: string | BinaryData,
				descriptors?: FontFaceDescriptors | undefined
			): FontFace;
			prototype: FontFace;
		};
	}
}

export enum VERTICAL_ALIGN {
	TOP,
	CENTER,
	BOTTOM,
}

export enum HORIZONTAL_ALIGN {
	LEFT = "left",
	CENTER = "center",
	RIGHT = "right",
}

export interface CssType extends Partial<CSSStyleDeclaration> {
	"-webkit-backface-visibility"?: string;
	"-webkit-transform"?: string;
	scrollbarWidth?: string;
	textWrap?: string;
}

export interface ComponentBaseType {
	id: string; // div id
	debug?: boolean;
	clickUrl: string; // main url redirection
	floodlight?: string; // main floodlight pixel
	onClick: (url: string) => void; // onClick callback
}

export type LiveStreamData = {
	url: string;
	duration: number;
	Hls: any;
};

export const defaultComponentValues: Required<ComponentBaseType> = {
	id: "default-component-id",
	debug: true,
	clickUrl: "https://www.dailymotion.com",
	floodlight: "",
	onClick: (url?: string) => console.log("click to url: ", url),
};
