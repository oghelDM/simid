import { createDiv } from "../utils/divMaker";
import { getClientXY, keepSafe, map, trackPixel } from "../utils/helper";
import { ComponentBaseType, CssType, defaultComponentValues } from "../types";
import { INTERACTION_TYPE, Tracking } from "@/utils/tracking";

export interface IndexManagerType extends ComponentBaseType {
	focusedElementWidth: number; // the width in percent, occupied by the focused element
	focusedElementHeight: number; // the height in percent, occupied by the focused element
	startIndex?: number;
	onIndexChange?: (index: number) => void; // callback used when the currentIndex is updated
	onIndexChanged?: (index: number) => void; // callback used when the currentIndex reaches a new stopping value
	isInteractive?: boolean;
	autoPlay?: boolean;
	speedCoefficient?: number;
	isVertical?: boolean; // whether the user interaction should be vertical or not
	onClick: (url: string) => void;
	fadeObjects?: HTMLElement[][];
	arrows?: HTMLElement[];
	productUrls: string[]; // image elements
	clickUrls?: string[]; // optional redirection urls for each product
	floodlights?: string[]; // optional floodlight urls for each product
}

export const defaultPropsIndexManager: Required<IndexManagerType> = {
	...defaultComponentValues,
	id: "carouselBasicDM",
	startIndex: 0,
	focusedElementWidth: 60,
	focusedElementHeight: 60,
	onIndexChange: (_: number) => {},
	onIndexChanged: (_: number) => {},
	isInteractive: true,
	autoPlay: false,
	speedCoefficient: 1,
	isVertical: false,
	onClick: () => console.log("click on IndexManager"),
	fadeObjects: [],
	arrows: [],
	productUrls: [
		"https://images.unsplash.com/photo-1696464795756-2d92a11c504f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwxM3x8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60",
		"https://images.unsplash.com/photo-1695496573688-3e0e8ac8657e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwyMHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60",
		"https://images.unsplash.com/photo-1695456261833-3794ab617deb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw0Mnx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60",
		"https://plus.unsplash.com/premium_photo-1694670200212-3122e7c5c9b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw2NHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60",
		"https://images.unsplash.com/photo-1695878026745-1d07d1088045?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw2N3x8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60",
	],
	clickUrls: [
		"https://www.google.com/search?q=0",
		"https://www.google.com/search?q=1",
		"https://www.google.com/search?q=2",
		"https://www.google.com/search?q=3",
		"https://www.google.com/search?q=4",
	],
	floodlights: [],
};

export class IndexManager extends HTMLElement {
	protected nbProducts: number;
	protected cleanProps: Required<IndexManagerType>;
	protected currentIndex: number;

	private previousIndex: number;
	private mouseXorY: number;
	private isMouseDown: boolean = false;
	private mouseHasMoved: boolean = false;
	private debugCurrentIndexDiv: HTMLElement;
	private debugElementDiv: HTMLElement;

	private autoPlayTimeoutId: number | undefined;
	private autoPlayIntervalId: number | undefined;
	private rafId: number;

	private window: Window;

	public init(props: IndexManagerType, window: Window, style: CssType) {
		// clean-up previous instance
		this.window = window;
		this.window.clearTimeout(this.autoPlayTimeoutId);
		this.window.clearInterval(this.autoPlayIntervalId);

		while (this.firstChild) {
			this.removeChild(this.firstChild);
		}

		this.cleanProps = {
			...defaultPropsIndexManager,
			...props,
		};

		const {
			id,
			startIndex,
			debug,
			isInteractive,
			autoPlay,
			arrows,
			productUrls,
		} = this.cleanProps;

		this.setAttribute("id", id);
		this.previousIndex = startIndex;
		this.currentIndex = startIndex;
		this.nbProducts = productUrls.length;

		const actualStyle: CssType = {
			display: "block",
			position: "absolute",
			width: "100%",
			height: "100%",
			opacity: "1",
			backgroundColor: debug ? "rgba(0,0,255,.4)" : "unset",
			overflow: "hidden",

			...style,
		};

		for (const [key, value] of Object.entries(actualStyle)) {
			(this.style as any)[key] = value;
		}

		if (isInteractive) {
			this.setUpPointerEvents(id);
		}

		if (autoPlay) {
			this.startAutoPlay();
		}

		arrows.forEach((arrow, i) =>
			arrow.addEventListener("click", (e) => {
				e.preventDefault();
				e.stopPropagation();
				Tracking.sendTracker(
					`arrow-${i === 1 ? "left" : "right"}`,
					INTERACTION_TYPE.click,
					e
				);
				this.stopAutoPlay();
				this.moveIndexBy(i === 0 ? 1 : -1);
			})
		);

		if (debug) {
			this.debugElementDiv = createDiv("debugElementDiv", {
				width: `${this.cleanProps.focusedElementWidth}%`,
				height: "100px",
				backgroundColor: "red",
				opacity: "0.8",
				position: "absolute",
				bottom: "0",
				pointerEvents: "none",
			});
			this.appendChild(this.debugElementDiv);
			this.debugCurrentIndexDiv = createDiv("currIdx", {
				backgroundColor: "#ffffff88",
				position: "absolute",
				pointerEvents: "none",
				padding: "2px 8px",
				fontFamily: "monospace",
				fontSize: "18px",
			});
			this.debugCurrentIndexDiv.innerHTML = this.currentIndex.toFixed(2);
			this.appendChild(this.debugCurrentIndexDiv);
		}
	}

	private setUpPointerEvents = (id: string): void => {
		const interactionDiv = createDiv(`${id}-interaction`, {
			display: "block",
			position: "absolute",
			width: "100%",
			height: "100%",
			cursor: "pointer",
		});
		this.appendChild(interactionDiv);

		interactionDiv.addEventListener("pointerdown", (e: PointerEvent) =>
			this.onMouseDown(e)
		);
		interactionDiv.addEventListener("pointermove", (e: PointerEvent) =>
			this.onMouseMove(e)
		);
		interactionDiv.addEventListener("pointerup", (e: PointerEvent) =>
			this.onMouseUp(e)
		);
		interactionDiv.addEventListener("pointerout", (e: PointerEvent) =>
			this.onMouseUp(e)
		);
		interactionDiv.addEventListener("pointerleave", (e: PointerEvent) =>
			this.onMouseUp(e)
		);
		interactionDiv.addEventListener("click", (e: PointerEvent) => {
			e.preventDefault();
			e.stopPropagation();
		});
	};

	protected update(): void {
		const { onIndexChange, debug, fadeObjects, focusedElementWidth } =
			this.cleanProps;

		onIndexChange(this.currentIndex);
		if (debug) {
			this.debugCurrentIndexDiv.innerText = this.currentIndex.toFixed(2);
			this.debugElementDiv.style.left = `${
				-1 * this.currentIndex * focusedElementWidth
			}%`;
		}

		fadeObjects.forEach((elements, i) => {
			const safeIdx = keepSafe(this.currentIndex, this.nbProducts);
			let d = Math.abs(i - safeIdx);
			if (d > this.nbProducts / 2) {
				d = Math.abs(d - this.nbProducts);
			}
			const opacity = 1 - Math.min(d, 1);
			elements?.forEach(
				(element) => (element.style.opacity = `${opacity}`)
			);
		});
	}

	private onMouseDown = (e: PointerEvent): void => {
		this.window.cancelAnimationFrame(this.rafId);
		this.stopAutoPlay();

		this.previousIndex = this.currentIndex;
		this.isMouseDown = true;
		this.mouseHasMoved = false;
		const clientXY = getClientXY(e);
		this.mouseXorY = clientXY[this.cleanProps.isVertical ? "y" : "x"];
	};

	private onMouseMove = (e: PointerEvent): void => {
		if (!this.isMouseDown) {
			return;
		}
		const { isVertical, focusedElementWidth, focusedElementHeight } =
			this.cleanProps;

		this.mouseHasMoved = true;
		this.previousIndex = this.currentIndex;

		const clientXY = getClientXY(e);
		const mouseXorY = clientXY[isVertical ? "y" : "x"];

		const delta = this.mouseXorY - mouseXorY;
		const focusedElementSizeInPixels =
			(this.getBoundingClientRect()[isVertical ? "height" : "width"] *
				(isVertical ? focusedElementHeight : focusedElementWidth)) /
			100;
		this.currentIndex += delta / focusedElementSizeInPixels;

		this.mouseXorY = mouseXorY;
		this.update();
	};

	private onMouseUp = (e: PointerEvent): void => {
		if (!this.isMouseDown) {
			return;
		}
		e.preventDefault();
		e.stopPropagation();
		this.isMouseDown = false;
		const { onClick, clickUrl, clickUrls, floodlights } = this.cleanProps;
		if (!this.mouseHasMoved) {
			const idx = Math.round(
				keepSafe(this.currentIndex, this.nbProducts)
			);
			Tracking.sendTracker(
				`collection-item-${idx}`,
				INTERACTION_TYPE.clickThrough,
				e
			);
			if (floodlights[idx]) {
				trackPixel(floodlights[idx]);
			}

			let redirectUrl = clickUrl;
			if (clickUrls.length > 0) {
				redirectUrl = clickUrls[idx] || redirectUrl;
			}
			onClick(redirectUrl);
			return;
		}
		const dx = (this.currentIndex - this.previousIndex) * 3;
		const targetIndex = Math.round(this.currentIndex + dx);
		this.goToIndex(targetIndex);
	};

	private goToIndex = (targetIndex: number): void => {
		this.window.cancelAnimationFrame(this.rafId);

		this.rafId = this.window.requestAnimationFrame(() =>
			this.render(this.currentIndex, targetIndex)
		);
	};

	render = (startIdx: number, targetIndex: number, value = 0) => {
		// const easingValue = value * value * value; // easeOutCubic
		const easingValue = value === 1 ? 1 : 1 - Math.pow(2, -10 * value); // easeOutExpo
		const newValue = value + 0.025 * this.cleanProps.speedCoefficient;
		if (newValue >= 1) {
			this.currentIndex = targetIndex;
			this.window.cancelAnimationFrame(this.rafId);
			this.update();
			this.cleanProps.onIndexChanged(
				keepSafe(targetIndex, this.nbProducts)
			);
		} else {
			this.currentIndex = map(easingValue, 0, 1, startIdx, targetIndex);
			this.update();
			this.rafId = this.window.requestAnimationFrame(() =>
				this.render(startIdx, targetIndex, newValue)
			);
		}
	};

	public moveIndexBy = (deltaIndex: number): void => {
		this.goToIndex(Math.round(this.currentIndex + deltaIndex));
	};

	public startAutoPlay = (
		delay: number = 3,
		frequency: number = 1.5,
		deltaIndex: number = 1
	): void => {
		this.autoPlayTimeoutId = this.window.setTimeout(() => {
			let nbAutoSwipe = 0;
			this.autoPlayIntervalId = this.window.setInterval(() => {
				this.goToIndex(Math.round(this.currentIndex + deltaIndex));

				// prevent IMA lag after too many swipes
				if (++nbAutoSwipe === this.cleanProps.productUrls.length) {
					this.window.clearInterval(this.autoPlayIntervalId);
				}
			}, frequency * 1000);
		}, delay);
	};

	public stopAutoPlay = (): void => {
		if (this.autoPlayTimeoutId || this.autoPlayIntervalId) {
			this.window.clearTimeout(this.autoPlayTimeoutId);
			this.window.clearInterval(this.autoPlayIntervalId);
			this.autoPlayTimeoutId = undefined;
			this.autoPlayIntervalId = undefined;
		}
	};
}

// declare the new web component to allow constructor instanciation
customElements.define("dm-index-manager", IndexManager);
