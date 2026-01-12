import { ImageDM } from "./image";
import { CssType } from "../types";
import { INTERACTION_TYPE, Tracking } from "@/utils/tracking";

interface ButtonBounceProps {
	openBtnStyle?: CssType;
	triggerZoneStyle?: CssType; // the style of the Element that will cpature the click/swipe
	openBtnLeftStart: string;
	openBtnLeftEnd: string;
	onOpen: () => void;
}

export class ButtonBounce extends HTMLElement {
	private openBtn: HTMLElement;
	private triggerZone: HTMLElement;
	private mousePosition = { x: 0, y: 0 };
	private isMouseDown = false;
	private onOpen: () => void;
	private forwardAnim?: Animation;
	private backwardAnim?: Animation;
	private openBtnLeftEnd: string;
	private openBtnLeftStart: string;

	constructor(id: string, props: ButtonBounceProps) {
		super();

		this.id = id;
		this.style.position = "absolute";
		this.style.width = "100%";
		this.style.height = "100%";
		this.style.left = "0";
		this.style.top = "0";
		this.style.pointerEvents = "none";

		const {
			openBtnLeftStart,
			openBtnLeftEnd,
			openBtnStyle = {},
			onOpen,
		} = props;
		this.onOpen = onOpen;
		this.openBtnLeftStart = openBtnLeftStart;
		this.openBtnLeftEnd = openBtnLeftEnd;

		this.openBtn = new ImageDM("openBtn", "", {
			left: openBtnLeftStart,
			backgroundSize: "contain",
			pointerEvents: "none",
			...(openBtnStyle || {}),
			// backgroundColor: "rgba(255,0,0,.4)",
		});
		this.appendChild(this.openBtn);

		this.animateOpenBtn();

		this.triggerZone = new ImageDM("triggerZone", "", {
			cursor: "pointer",
			pointerEvents: "auto",
			...props.triggerZoneStyle,
			// backgroundColor: "rgba(255,0,0,.4)",
		});
		this.appendChild(this.triggerZone);
		this.triggerZone.addEventListener("click", (e) => {
			e.preventDefault();
			e.stopPropagation();
			this.toggle(true, e);
		});
		this.triggerZone.addEventListener("pointerdown", (e) => {
			e.preventDefault();
			e.stopPropagation();
			const { clientX, clientY } = e;
			this.mousePosition = { x: clientX, y: clientY };
			this.isMouseDown = true;
		});
		this.triggerZone.addEventListener(
			"pointerleave",
			() => (this.isMouseDown = false)
		);
		this.triggerZone.addEventListener(
			"pointerout",
			() => (this.isMouseDown = false)
		);
		this.triggerZone.addEventListener(
			"pointerup",
			() => (this.isMouseDown = false)
		);
		this.triggerZone.addEventListener("pointermove", (e) => {
			e.preventDefault();
			e.stopPropagation();

			if (!this.isMouseDown) {
				return;
			}

			const { clientX } = e;
			const dx = clientX - this.mousePosition.x;
			if (Math.abs(dx) > 10) {
				this.toggle(true, e);
			}
		});
	}

	public toggle(show: boolean, e: MouseEvent = new MouseEvent("")) {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}

		if (show) {
			Tracking.sendTracker(this.id, INTERACTION_TYPE.click, e);
			this.onOpen();
		}

		this.triggerZone.style.pointerEvents = show ? "none" : "auto";

		// leave the button at the current position (mid-animation)
		[this.forwardAnim, this.backwardAnim].forEach((anim) => {
			anim?.pause();
			anim?.commitStyles();
			anim?.cancel();
		});

		const left = this.openBtn.getBoundingClientRect().left;
		this.openBtn.style.left = `${left}px`;

		this.forwardAnim = this.openBtn.animate(
			[
				{ left: `${left}px` },
				{ left: show ? this.openBtnLeftEnd : this.openBtnLeftStart },
			],
			{
				duration: 500,
				iterations: 1,
				fill: "forwards",
				easing: "ease-out",
			}
		);
	}

	private animateOpenBtn = () => {
		const leftAnimEnd = `${parseFloat(this.openBtnLeftStart) + 4}%`;
		this.forwardAnim = this.openBtn.animate(
			[{ left: this.openBtnLeftStart }, { left: leftAnimEnd }],
			{
				delay: 1600,
				duration: 500,
				iterations: 1,
				fill: "forwards",
				easing: "ease-out",
			}
		);
		this.forwardAnim.onfinish = () => {
			this.backwardAnim = this.openBtn.animate(
				[{ left: leftAnimEnd }, { left: this.openBtnLeftStart }],
				{
					duration: 170,
					delay: 900,
					iterations: 1,
					fill: "forwards",
					easing: "ease-out",
				}
			);
			this.backwardAnim.onfinish = () => this.animateOpenBtn();
		};
	};
}

// declare the new web component to allow constructor instanciation
customElements.define("dm-button", ButtonBounce);
