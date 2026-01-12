import { ComponentBaseType, defaultComponentValues } from "../../types";

export interface ScratchType extends ComponentBaseType {
	cursorUrl?: string;
	timeoutDuration?: number; // time before the scratch auto reveals, in milliseconds
	backImageUrl: string;
	frontImageUrl: string;
	scratchImageUrl?: string;
	scratchSizeCoeff?: number;
	cursorAutoRotate?: boolean;
	onAutoRevealStart?: () => void;
	onAutoRevealComplete?: () => void;
	onUserScratchStart?: () => void;
}

export const defaultValuesScratch: Required<ScratchType> = {
	...defaultComponentValues,
	id: "scratch-dm",
	onClick: () => console.log("click on scratch"),
	onAutoRevealStart: () => console.log("auto reveal start"),
	onAutoRevealComplete: () => console.log("auto reveal complete"),
	onUserScratchStart: () => console.log("user scratch start"),
	cursorUrl: "https://statics.dmcdn.net/d/devTools/assets/scratch/target.png",
	timeoutDuration: 4000,
	backImageUrl:
		"https://statics.dmcdn.net/d/devTools/assets/scratch/vodafone_back.png",
	frontImageUrl:
		"https://statics.dmcdn.net/d/devTools/assets/scratch/vodafone_front.png",
	scratchImageUrl:
		"https://statics.dmcdn.net/d/devTools/assets/scratch/scratch1.png",
	scratchSizeCoeff: 2,
	cursorAutoRotate: true,
};
