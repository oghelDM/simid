import { CssType } from "@/types";
import { CACHE_QUERY } from "../image";
import { createDiv } from "../../utils/divMaker";
import { BaseComponent } from "../BaseComponent";
import { keepSafe, trackPixel } from "@/utils/helper";
import { INTERACTION_TYPE, Tracking } from "@/utils/tracking";
import { CollectionType, defaultValuesCollection } from "./defaultValues";

export class Collection extends BaseComponent {
	protected cleanProps: Required<CollectionType>;
	public products: HTMLElement[];
	private nbProducts: number;
	private isAnimationPlaying = false;
	public currIdx = 0; // the index of the currently displayed product
	private autoPlayTimeoutId: number | undefined;
	private autoPlayIntervalId: number | undefined;
	// swipe detection
	private isMouseDown = false;
	private mouseHasMoved: boolean = false;
	private mousePosition = { clientX: 0, clientY: 0 };

	constructor(props: CollectionType, style: CssType = {}) {
		super(
			{ ...props, clickUrl: "", floodlight: "" }, // clickUrl is detected by the Collection component, not the BaseComponent
			{
				position: "absolute",
				height: "100%",
				width: "100%",
				backgroundColor: props.debug ? "#00ff88ff" : "unset",
				pointerEvents: "auto",
				cursor: "pointer",
				touchAction: `${
					props.isVertical ? "pan-x" : "pan-y"
				} pinch-zoom`,
				...style,
			}
		);

		this.init(props);

		this.initSwipeEvents();
	}

	private initSwipeEvents = () => {
		const {
			isInteractive,
			isVertical,
			clickUrl,
			clickUrls,
			floodlight,
			floodlights,
			onClick,
		} = this.cleanProps;

		// interaction div
		this.addEventListener("pointerdown", (e) => {
			e.preventDefault();
			e.stopPropagation();
			const { clientX, clientY } = e;
			this.mousePosition = { clientX, clientY };
			this.isMouseDown = true;
			this.mouseHasMoved = false;
		});

		this.addEventListener("pointerleave", () => (this.isMouseDown = false));

		this.addEventListener("pointerout", () => (this.isMouseDown = false));

		this.addEventListener("pointerup", (e) => {
			e.preventDefault();
			e.stopPropagation();
			if (!this.isMouseDown) {
				return;
			}
			this.isMouseDown = false;

			if (!this.mouseHasMoved) {
				if (floodlights[this.currIdx]) {
					trackPixel(floodlights[this.currIdx]);
				}
				if (floodlight) {
					trackPixel(floodlight);
				}
				if (clickUrls[this.currIdx]) {
					onClick(clickUrls[this.currIdx]);
					Tracking.sendTracker(
						`collection-item-${this.currIdx}`,
						INTERACTION_TYPE.clickThrough,
						e
					);
				} else if (clickUrl) {
					onClick(clickUrl);
					Tracking.sendTracker(
						`collection-item-${this.currIdx}`,
						INTERACTION_TYPE.clickThrough,
						e
					);
				}
			}
		});

		this.addEventListener("pointermove", (e) => {
			if (!this.isMouseDown) {
				return;
			}
			e.preventDefault();
			e.stopPropagation();
			this.mouseHasMoved = true;

			if (!isInteractive) {
				return;
			}
			const { clientX, clientY } = e;
			const dx = clientX - this.mousePosition.clientX;
			const dy = clientY - this.mousePosition.clientY;
			if (isVertical && Math.abs(dy) > 30) {
				Tracking.sendTracker(
					"collection",
					dy > 0
						? INTERACTION_TYPE.swipeBottom
						: INTERACTION_TYPE.swipeTop,
					e
				);
				dy > 0 ? this.goToNext() : this.goToPrevious();
				this.isMouseDown = false;
			} else if (Math.abs(dx) > 30) {
				Tracking.sendTracker(
					"collection",
					dx > 0
						? INTERACTION_TYPE.swipeRight
						: INTERACTION_TYPE.swipeLeft,
					e
				);
				dx > 0 ? this.goToNext() : this.goToPrevious();
				this.isMouseDown = false;
			}
		});
	};

	private init = (props: CollectionType) => {
		this.cleanProps = {
			...defaultValuesCollection,
			...props,
		};

		const {
			productUrls,
			id,
			styleProductFocused,
			startIndex,
			arrows,
			debug,
			fadeObjects,
			autoPlay,
		} = this.cleanProps;

		this.nbProducts = productUrls.length;
		this.currIdx = keepSafe(startIndex, this.nbProducts);

		this.products = productUrls.map((url, index) => {
			const isCurrentProduct = index === this.currIdx;
			const element = createDiv(`${id}-product-${index}`, {
				...styleProductFocused,
				backgroundImage: `url(${url}${CACHE_QUERY})`,
				outline: debug ? "1px solid pink" : "unset",
				opacity: isCurrentProduct ? "1" : "0",
				pointerEvents: "none",
			});

			// position the elements behind the interactive div
			// this.insertBefore(element, this.childNodes[0]);
			this.appendChild(element);
			return element;
		});
		// make sure the first product is above all other ones
		this.appendChild(this.products[this.currIdx]);

		// initialize fadeObjects opacity
		fadeObjects.forEach((elements, i) =>
			elements.forEach(
				(element) =>
					(element.style.opacity = i === this.currIdx ? "1" : "0")
			)
		);

		arrows.forEach((arrow, i) =>
			arrow.addEventListener("click", (e) => {
				e.preventDefault();
				e.stopPropagation();
				Tracking.sendTracker(
					`arrow-${i === 0 ? "left" : "right"}`,
					INTERACTION_TYPE.click,
					e
				);
				if (i === 0) {
					this.goToPrevious();
				} else {
					this.goToNext();
				}
			})
		);

		if (autoPlay) {
			this.startAutoPlay();
		}
	};

	public goToPrevious = () => this.startAnimation(true, false);

	public goToNext = () => this.startAnimation(false, false);

	public goToIndex = (index: number) =>
		this.startAnimation(false, false, index);

	public startAutoPlay = (
		delay: number = this.cleanProps.autoplayDelay,
		period: number = this.cleanProps.autoplayPeriod
	): void => {
		this.stopAutoPlay();
		this.autoPlayTimeoutId = window.setTimeout(() => {
			this.startAnimation(false, true);
			this.autoPlayIntervalId = window.setInterval(
				() => this.startAnimation(false, true),
				period * 1000
			);
		}, delay * 1000);
	};

	public stopAutoPlay = () => {
		window.clearTimeout(this.autoPlayTimeoutId);
		window.clearInterval(this.autoPlayIntervalId);
	};

	private startAnimation = (
		isLeft: boolean,
		isAutoPlay: boolean,
		newIndex?: number // force any given index
	) => {
		if (!isAutoPlay) {
			this.stopAutoPlay();
		}
		if (this.isAnimationPlaying) {
			return;
		}

		const {
			styleProductFocused,
			styleProductOutLeft,
			styleProductOutRight,
			styleProductInLeft,
			styleProductInRight,
			introAnimationProperties,
			outroAnimationProperties,
			fadeObjects,
			onIndexChange,
		} = this.cleanProps;

		let nextIdx = keepSafe(
			this.currIdx + (isLeft ? -1 : 1),
			this.nbProducts
		);
		if (typeof newIndex === "number") {
			nextIdx = newIndex;
		}

		onIndexChange(nextIdx, this.currIdx, isLeft);
		const currProduct = this.products[this.currIdx];
		const nextProduct = this.products[nextIdx];
		this.appendChild(nextProduct);

		// // make sure to reset the css properties
		// currProduct.getAnimations()[0]?.cancel();
		// nextProduct.getAnimations()[0]?.cancel();
		// for (const [key, value] of Object.entries(styleProductFocused)) {
		// 	(nextProduct.style as any)[key] = value;
		// }

		let animDoneCounter = 0;
		const animationDone = () => {
			animDoneCounter += 1;
			if (animDoneCounter === 2) {
				this.currIdx = nextIdx;
				this.isAnimationPlaying = false;
			}
		};

		this.isAnimationPlaying = true;
		const outroAnim = currProduct.animate(
			[
				styleProductFocused,
				isLeft ? styleProductOutLeft : styleProductOutRight,
			] as any,
			{
				...outroAnimationProperties,
				fill: "forwards",
				iterations: 1,
			}
		);
		const introAnim = nextProduct.animate(
			[
				isLeft ? styleProductInRight : styleProductInLeft,
				styleProductFocused,
			] as any,
			{
				...introAnimationProperties,
				fill: "forwards",
				iterations: 1,
			}
		);

		const currFadeObjects = fadeObjects[this.currIdx];
		currFadeObjects?.forEach((fadeObject) =>
			fadeObject.animate([{ opacity: "1" }, { opacity: "0" }], {
				...outroAnimationProperties,
				fill: "forwards",
				iterations: 1,
			})
		);
		const nextFadeObjects = fadeObjects[nextIdx];
		nextFadeObjects?.forEach((fadeObject) =>
			fadeObject.animate([{ opacity: "0" }, { opacity: "1" }], {
				...introAnimationProperties,
				fill: "forwards",
				iterations: 1,
			})
		);

		outroAnim.addEventListener("finish", animationDone);
		introAnim.addEventListener("finish", animationDone);
	};
}

// declare the new web component to allow constructor instanciation
customElements.define("dm-collection", Collection);
