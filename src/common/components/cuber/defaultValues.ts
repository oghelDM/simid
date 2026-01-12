import { IndexManagerType, defaultPropsIndexManager } from "../indexManager";

export interface CuberType extends IndexManagerType {
	parent: HTMLElement; // the parent DOM element (usually the creative root), necessary to compute the faces dimensions
	faceLeft?: number | null; // same as the usual css left property for the focused face
	faceRight?: number | null; // same as the usual css right property for the focused face
	faceTop?: number | null; // same as the usual css top property for the focused face
	faceBottom?: number | null; // same as the usual css bottom property for the focused face
	perspective?: number; // 3D perspective
	perspectiveOrigin?: string; // defines the 3d transform origin perspective (eg. '50%' or '0% 50%')
}

export const defaultValuesCuber: Required<CuberType> = {
	...defaultPropsIndexManager,
	id: "cuber-dm",
	onClick: () => console.log("click on cuber"),
	faceLeft: (100 - defaultPropsIndexManager.focusedElementWidth) / 2,
	faceTop: (100 - defaultPropsIndexManager.focusedElementHeight) / 2,
	faceRight: null,
	faceBottom: null,
	parent: document.getElementById("player-wrapper") as HTMLElement,
	perspective: 6,
	perspectiveOrigin: "50% 50%",
};
