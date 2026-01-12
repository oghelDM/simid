import { CssType } from "@/types";
import { CACHE_QUERY } from "../image";
import { cover, getClientXY, map } from "../../utils/helper";
import { INTERACTION_TYPE, Tracking } from "@/utils/tracking";
import { ScratchType, defaultValuesScratch } from "./defaultValues";

export class Scratch extends HTMLElement {
	protected cleanProps: Required<ScratchType>;

	private styleProps: CssType;

	private canvas: HTMLCanvasElement;
	private context: CanvasRenderingContext2D;
	private hasRevealed: boolean = false;
	private hasUserInteracted: boolean = false;
	private isReadyToDraw: boolean = false;
	private cursorOffset = { x: 0, y: 0 }; // the offset that depends on the custom cursor and the resize
	private imgFront: HTMLImageElement; // the image drawn on the canvas, that is to be scratched away
	private imgScratch: HTMLImageElement; // the image used to scratch on the scratch canvas
	private cursorImage: HTMLImageElement; // the image used as a cursor
	private timeoutId: number;
	private originalSize = { width: 1, height: 1 }; // original canvas size, used to resize properly

	constructor(props: ScratchType, styleProps: CssType = {}) {
		super();

		this.cleanProps = { ...defaultValuesScratch, ...props };
		this.styleProps = { ...styleProps };

		const { id, onClick, clickUrl, frontImageUrl } = this.cleanProps;

		this.setAttribute("id", id);

		this.canvas = document.createElement("canvas");
		this.canvas.setAttribute("id", `${id}-canvas`);
		this.canvas.style.cursor = "pointer";
		this.canvas.style.width = "100%";
		this.canvas.style.height = "100%";
		this.appendChild(this.canvas);

		this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;

		this.imgFront = new Image();
		this.imgFront.src = frontImageUrl + CACHE_QUERY;

		this.addEventListener("pointermove", (e) => this.pointerMove(e));
		this.addEventListener("click", (e) => {
			e.stopPropagation();
			e.preventDefault();
			onClick(clickUrl);
		});
		window.addEventListener("resize", () => {
			if (!this.cursorImage) {
				return;
			}
			const { width, height } = this.getBoundingClientRect();
			this.cursorOffset.x =
				(this.cursorImage.naturalWidth / 2 / width) *
				this.originalSize.width;
			this.cursorOffset.y =
				(this.cursorImage.naturalHeight / 2 / height) *
				this.originalSize.height;
		});
	}

	public init = (props?: ScratchType, styleProps?: any) => {
		this.cleanProps = { ...this.cleanProps, ...(props || {}) };

		const {
			debug,
			scratchImageUrl,
			backImageUrl,
			cursorUrl,
			timeoutDuration,
			onAutoRevealStart,
			onAutoRevealComplete,
		} = this.cleanProps;

		this.styleProps = {
			position: "absolute",
			width: "100%",
			height: "100%",
			backgroundColor: debug ? "#ff00ff77" : "unset",
			backgroundImage: `url(${backImageUrl}${CACHE_QUERY})`,
			backgroundSize: "cover",
			backgroundRepeat: "no-repeat",
			backgroundPosition: "center",
			transition: "opacity .3s",
			opacity: 0,
			touchAction: "none",

			...this.styleProps,
			...(styleProps || {}),
		};

		for (const [key, value] of Object.entries(this.styleProps)) {
			(this.style as any)[key] = value;
		}

		this.hasUserInteracted = false;

		if (cursorUrl) {
			this.cursorImage = new Image();
			this.cursorImage.onload = () => {
				this.cursorOffset.x = this.cursorImage.naturalWidth / 2;
				this.cursorOffset.y = this.cursorImage.naturalHeight / 2;
				this.canvas.style.cursor = `url(${cursorUrl}${CACHE_QUERY}), pointer`;
			};
			this.cursorImage.src = cursorUrl + CACHE_QUERY;
		}

		this.canvas.style.opacity = "1";
		window.clearTimeout(this.timeoutId);
		if (timeoutDuration) {
			this.timeoutId = window.setTimeout(() => {
				this.forceReveal();
				onAutoRevealStart();
				setTimeout(() => onAutoRevealComplete());
			}, timeoutDuration);
		}

		if (scratchImageUrl) {
			this.imgScratch = new Image();
			this.imgScratch.src = scratchImageUrl + CACHE_QUERY;
		}

		const { left, right, top, bottom } = this.getBoundingClientRect();
		this.canvas.width =
			Math.round(devicePixelRatio * right) -
			Math.round(devicePixelRatio * left);
		this.canvas.height =
			Math.round(devicePixelRatio * bottom) -
			Math.round(devicePixelRatio * top);
		this.originalSize = {
			width: this.canvas.width,
			height: this.canvas.height,
		};

		if (this.imgFront.complete) {
			this.drawFrontImageOnCanvas();
		} else {
			this.imgFront.onload = () => this.drawFrontImageOnCanvas();
		}
	};

	drawFrontImageOnCanvas = () => {
		const {
			offsetX,
			offsetY,
			width: imageWidth,
			height: imageHeight,
		} = cover(
			this.canvas.width,
			this.canvas.height,
			this.imgFront.naturalWidth,
			this.imgFront.naturalHeight
		);
		this.context.globalCompositeOperation = "source-over";
		this.context.drawImage(
			this.imgFront,
			offsetX,
			offsetY,
			imageWidth,
			imageHeight
		);
		this.isReadyToDraw = true;
		this.style.opacity = "1";
		// from now on, any drawing on the canvas is punch-through
		this.context.globalCompositeOperation = "destination-out";
	};

	// called when the HTMLElement is added to the document
	connectedCallback() {
		this.init();
	}

	public pointerMove = (e: PointerEvent) => {
		e.preventDefault();
		if (!this.isReadyToDraw) {
			return;
		}
		const {
			scratchImageUrl,
			scratchSizeCoeff,
			cursorAutoRotate,
			timeoutDuration,
			onAutoRevealStart,
			onAutoRevealComplete,
			onUserScratchStart,
		} = this.cleanProps;

		const boundingClientRect = this.getBoundingClientRect();
		const { width, height } = boundingClientRect;
		const { x, y } = getClientXY(e, boundingClientRect);
		const xxx =
			map(x, 0, width, 0, this.canvas.width) + this.cursorOffset.x;
		const yyy =
			map(y, 0, height, 0, this.canvas.height) + this.cursorOffset.y;
		if (scratchImageUrl && this.imgScratch.complete) {
			const { naturalWidth, naturalHeight } = this.imgScratch;
			// default size is 10% of the smallest component dimension
			const sizeCoeff =
				((scratchSizeCoeff as number) *
					0.1 *
					Math.min(this.canvas.width, this.canvas.height)) /
				Math.max(naturalWidth, naturalHeight);
			const scratchImageWidth = naturalWidth * sizeCoeff;
			const scratchImageHeight = naturalHeight * sizeCoeff;
			this.context.save();
			this.context.translate(xxx, yyy);
			if (cursorAutoRotate) {
				this.context.rotate(Math.random() * Math.PI * 2);
			}
			this.context.translate(
				-scratchImageWidth / 2,
				-scratchImageHeight / 2
			);
			this.context.drawImage(
				this.imgScratch,
				0,
				0,
				scratchImageWidth,
				scratchImageHeight
			);
			this.context.restore();
		} else {
			// default diameter is 10% of the smallest component dimension
			const radius =
				((scratchSizeCoeff as number) *
					0.1 *
					Math.min(this.canvas.width, this.canvas.height)) /
				2;
			this.context.beginPath();
			this.context.ellipse(xxx, yyy, radius, radius, 0, 0, 2 * Math.PI);
			this.context.fill();
		}

		if (!this.hasUserInteracted) {
			if (e.type === "custom") {
				return; // allow for auto/custom pointerEvents, like tooltip tutos
			}
			Tracking.sendTracker("scratch", INTERACTION_TYPE.swipe, e, "start");
			onUserScratchStart();
			this.hasUserInteracted = true;
		}
	};

	public forceReveal = () => {
		this.canvas.style.transition = "opacity 1s";
		this.canvas.style.opacity = "0";
		this.canvas.style.cursor = "unset";
	};
}

// declare the new web component to allow constructor instanciation
customElements.define("dm-scratch", Scratch);
