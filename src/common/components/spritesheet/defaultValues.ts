import { ComponentBaseType, defaultComponentValues } from "../../types";

export interface SpritesheetType extends ComponentBaseType {
	spriteSheetUrls: string[]; // the url(s) of the spritesheet(s) to use
	spriteWidth: number; // the width of the spritesheets in pixels
	spriteHeight: number; // the height of the spritesheets in pixels
	nbFramesW: number; // the horizontal number of frames per spritesheet
	nbFramesH: number; // the vertical number of frames per spritesheet
	nbFrames: number; // the max number of frames in one spritesheet
	framerate?: number; // the number of milliseconds each image is to be displayed
	isPaused?: boolean; // whether the spritesheet is paused at the beginning
	startFrame?: number; // the frame number to start the animation on
	isBackwards?: boolean; // whether the animation plays backwards
	isLoop?: boolean; // whether the animation loops
	window: Window;
	onReady?: () => void; // callback when spritesheet is ready to display (all images are loaded)
}

export const defaultValuesSpritesheet: SpritesheetType = {
	...defaultComponentValues,
	id: "spritesheet-dm",
	onClick: () => console.log("click on spritesheet"),

	spriteSheetUrls: [
		"https://statics.dmcdn.net/d/devTools/assets/spritesheet/sprite_bmw_0.png",
		"https://statics.dmcdn.net/d/devTools/assets/spritesheet/sprite_bmw_1.png",
	],
	nbFrames: 35,
	spriteWidth: 2036,
	spriteHeight: 1855,
	nbFramesW: 4,
	nbFramesH: 7,
	framerate: 70,
	isPaused: false,
	startFrame: 0,
	isBackwards: false,
	isLoop: true,
	window,
};

export const defaultValuesSpritesheet2: SpritesheetType = {
	...defaultValuesSpritesheet,
	id: "spritesheet-dm-2",

	spriteSheetUrls: [
		"https://statics.dmcdn.net/d/devTools/assets/spritesheet/sprite_fire.jpg",
	],
	spriteWidth: 800,
	spriteHeight: 800,
	nbFramesW: 8,
	nbFramesH: 8,
	nbFrames: 64,
	framerate: 70,
};
