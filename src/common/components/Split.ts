import { getClientXY } from "../utils/helper";
import { createDiv } from "../utils/divMaker";
import { ComponentBaseType, CssType } from "../types";

interface SplitType extends ComponentBaseType {
	leftImageUrl: string;
	rightImageUrl: string;
	originalPosition?: number;
	handleImageUrl?: string;
	handleWidth?: number;
}

export class Split extends HTMLElement {
	private handlePosition: number;
	private handleWidth: number;
	private divLeft: HTMLElement;
	private divRight: HTMLElement;
	private handle: HTMLElement;

	constructor(
		props: SplitType,
		style: CssType = {},
		imagesStyle: CssType = {}
	) {
		super();

		const {
			id,
			leftImageUrl,
			rightImageUrl,
			handleImageUrl = "https://statics.dmcdn.net/d/vpaid/split/assets/split.png",
			debug = false,
			originalPosition = 50,
			handleWidth = 44,
			clickUrl,
			onClick,
		} = props;

		this.setAttribute("id", id);
		const actualStyle: CssType = {
			display: "block",
			position: "absolute",
			width: "100%",
			height: "100%",
			opacity: "1",
			backgroundColor: debug ? "#00ff0088" : "unset",
			overflow: "hidden",

			...style,
		};
		for (const [key, value] of Object.entries(actualStyle)) {
			(this.style as any)[key] = value;
		}

		const [imgLeftDiv, imgRightDiv] = [leftImageUrl, rightImageUrl].map(
			(imageUrl, i) => {
				const div = createDiv(`split-${i === 0 ? "left" : "right"}`, {
					width: "100%",
					height: "100%",
					backgroundColor: debug ? "#000ff088" : "unset",
					position: "absolute",
					backgroundSize: "cover",
					backgroundImage: `url(${imageUrl})`,
					backgroundPosition: "left center",
					...imagesStyle,
				});
				return div;
			}
		);
		this.appendChild(imgRightDiv);

		this.divRight = createDiv("split-img-right-container", {
			width: "100%",
			height: "100%",
			position: "absolute",
			clipPath: `inset(0px 0px 0px ${100 - originalPosition}%)`,
		});
		this.appendChild(this.divRight);
		this.divRight.appendChild(imgRightDiv);

		this.divLeft = createDiv("split-img-left-container", {
			width: "100%",
			height: "100%",
			position: "absolute",
			clipPath: `inset(0px 0px 0px ${originalPosition}%)`,
		});
		this.appendChild(this.divLeft);
		this.divLeft.appendChild(imgLeftDiv);

		// handle width in pixels
		this.handleWidth = handleWidth;
		this.handle = createDiv("split-handle", {
			position: "absolute",
			top: "0%",
			width: `${this.handleWidth}px`, // max is 76px
			height: "100%",
			backgroundPosition: "center",
			backgroundRepeat: "no-repeat",
			backgroundSize: "contain",
			backgroundImage: `url(${handleImageUrl})`,
		});
		this.handle.style.left = `calc(${originalPosition}% - ${
			this.handleWidth / 2
		}px)`;
		this.appendChild(this.handle);

		this.addEventListener("pointermove", (e) => {
			e.stopImmediatePropagation();
			const boundingClientRect = this.getBoundingClientRect();
			const x = getClientXY(e, boundingClientRect).x;
			this.handlePosition = (x / boundingClientRect.width) * 100;
			this.handle.style.left = `${x - this.handleWidth / 2}px`;
			this.divLeft.style.clipPath = `inset(0px ${
				100 - this.handlePosition
			}% 0px 0px)`;
			this.divRight.style.clipPath = `inset(0px 0px 0px ${this.handlePosition}%)`;
		});

		this.addEventListener("click", () => onClick(clickUrl));
		window.addEventListener("resize", this.onWindowResize);
	}

	onWindowResize = () => {
		const { width } = this.getBoundingClientRect();
		const x = (this.handlePosition / 100) * width;
		this.handle.style.left = `${x - this.handleWidth / 2}px`;
		this.divLeft.style.clipPath = `inset(0px ${
			100 - this.handlePosition
		}% 0px 0px)`;
		this.divRight.style.clipPath = `inset(0px 0px 0px ${this.handlePosition}%)`;
	};
}

// declare the new web component to allow constructor instanciation
customElements.define("dm-split", Split);
