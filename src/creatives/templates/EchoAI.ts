import {
	INTERACTION_TARGET,
	INTERACTION_TYPE,
	Tracking,
} from "@/utils/tracking";
import { CssType } from "@/types";
import { ImageDM } from "@/components/image";
import { Creative, CreativeProps } from "@/creative";
import { ClickThrough } from "@/components/clickThrough";

export interface EchoAIProps {
	clickUrl: string; // redirection click url
	formId: string; // redirection form url
	openBtnStyle?: CssType;
	closeBtnStyle?: CssType;
	triggerZoneStyle?: CssType; // the style of the Element that will cpature the click/swipe
	bgColor?: string;
	openBtnLeftStart?: string;
	loadingIconColor?: string;
	openBtnLeftEnd?: string;
	bgAssetUrl: string;
	useLegalCover?: boolean;
}

const defaultProps: Required<EchoAIProps> = {
	clickUrl: "https://www.dailymotion.fr",
	formId: "",
	openBtnStyle: {},
	closeBtnStyle: {},
	triggerZoneStyle: {
		width: "0",
		height: "0",
		cursor: "pointer",
	},
	openBtnLeftStart: "20%",
	openBtnLeftEnd: "25%",
	bgAssetUrl: "",
	bgColor: "#ffffff",
	useLegalCover: true,
	loadingIconColor: "#000000",
};

const TRACKING_PERIOD = 3; // period at which a tracker is sent, in seconds, while the chat is open

export class EchoAITemplate extends Creative {
	protected myIframe: HTMLIFrameElement;
	protected chatContainer: HTMLElement;
	private openBtn: HTMLElement;
	private closeBtn: HTMLElement;
	protected triggerZone: HTMLElement; // the Element that will cpature the click/swipe
	private actualProps: Required<EchoAIProps>;
	private intervalId: number;
	private trackingCounter = 0;
	private mousePosition = { x: 0, y: 0 };
	private isMouseDown = false;
	private forwardAnim?: Animation;
	private backwardAnim?: Animation;

	constructor(
		root: HTMLElement,
		creativeProps: CreativeProps,
		chatAIProps: EchoAIProps
	) {
		super(root, creativeProps);

		this.actualProps = {
			...defaultProps,
			...chatAIProps,
		};

		const bg = new ClickThrough(
			"bg",
			this.actualProps.bgAssetUrl,
			this.actualProps.clickUrl,
			creativeProps.onClick
		);
		this.root.appendChild(bg);

		this.openBtn = new ImageDM(
			"openBtn",
			`${this.assetsPrefixUrl}btn.png`,
			{
				left: this.actualProps.openBtnLeftStart,
				backgroundSize: "contain",
				pointerEvents: "none",
				...this.actualProps.openBtnStyle,
				// backgroundColor: "rgba(255,0,0,.4)",
			}
		);
		this.root.appendChild(this.openBtn);

		this.animateOpenBtn(this.actualProps.openBtnLeftStart);

		this.chatContainer = new ImageDM("container", "", {
			opacity: "0",
			transition: "opacity 0.5s ease-in 0.1s",
			backgroundColor: this.actualProps.bgColor,
			pointerEvents: "none",
		});
		this.root.appendChild(this.chatContainer);

		const loadingIcon = new ImageDM("loadingIcon", "", {
			width: "6%",
			height: "auto",
			aspectRatio: "1 / 1",
			right: "47%",
			top: "40%",
			transformOrigin: "50% 47%",
			pointerEvents: "none",
		});
		loadingIcon.animate(
			[{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
			{
				duration: 1000,
				iterations: Infinity,
				fill: "forwards",
			}
		);
		this.chatContainer.appendChild(loadingIcon);

		try {
			fetch(
				"https://statics.dmcdn.net/d/PRODUCTION/2025/chatbot_AI/loading.svg"
			)
				.then((response) => response.text())
				.then((svgText) => {
					loadingIcon.innerHTML = svgText;
					const svgElement = loadingIcon.querySelector("svg");
					if (svgElement) {
						svgElement.setAttribute("width", "100%");
						svgElement.setAttribute("height", "100%");

						const paths = svgElement.querySelectorAll("path");
						paths.forEach((path) =>
							path.setAttribute(
								"fill",
								this.actualProps.loadingIconColor
							)
						);
					}
				});
		} catch (error) {
			console.error("Error loading SVG:", error);
		}

		const widthBreakPoint = 1022;
		this.myIframe = document.createElement("iframe");
		this.myIframe.style.position = "absolute";
		this.myIframe.style.transformOrigin = "0 0";
		this.myIframe.style.left = "0%";
		this.myIframe.style.width = "100%";
		this.myIframe.style.height = "100%";
		this.myIframe.style.border = "unset";
		this.myIframe.style.cursor = "pointer";
		this.myIframe.style.width = `${widthBreakPoint}px`;
		this.myIframe.style.height = "auto";
		this.myIframe.style.aspectRatio = "16 / 8.5";
		this.myIframe.style.transform = `scale(${
			this.root.getBoundingClientRect().width / widthBreakPoint
		})`;
		this.chatContainer.appendChild(this.myIframe);

		this.closeBtn = new ImageDM(
			"closeBtn",
			"https://statics.dmcdn.net/d/PRODUCTION/2025/chatbot_AI/close.svg",
			{
				width: "6%",
				height: "auto",
				aspectRatio: "1 / 1",
				right: "1%",
				top: "1%",
				cursor: "pointer",
				...this.actualProps.closeBtnStyle,
			}
		);
		this.closeBtn.addEventListener("click", (e) =>
			this.toggleMyIframe(false, e)
		);
		this.chatContainer.appendChild(this.closeBtn);

		if (this.actualProps.useLegalCover) {
			this.chatContainer.appendChild(
				new ImageDM("ml", "", {
					width: "100%",
					height: "auto",
					aspectRatio: "1920 / 145",
					bottom: "0",
					transition: "opacity 0.5s ease-in 0.1s",
					backgroundColor: this.actualProps.bgColor,
				})
			);
		}

		this.triggerZone = new ImageDM("triggerZone", "", {
			cursor: "pointer",
			...this.actualProps.triggerZoneStyle,
			// backgroundColor: "rgba(255,0,0,.4)",
		});
		this.root.appendChild(this.triggerZone);
		this.triggerZone.addEventListener("click", (e) =>
			this.toggleMyIframe(true, e)
		);
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
				this.toggleMyIframe(true, e);
			}
		});

		window.addEventListener("resize", () => {
			this.myIframe.style.transform = `scale(${
				this.root.getBoundingClientRect().width / 1023
			})`;
		});
	}

	private animateOpenBtn = (leftStart: string) => {
		const leftAnimEnd = `${parseFloat(leftStart) + 4}%`;
		this.forwardAnim = this.openBtn.animate(
			[{ left: leftStart }, { left: leftAnimEnd }],
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
				[{ left: leftAnimEnd }, { left: leftStart }],
				{
					duration: 170,
					delay: 900,
					iterations: 1,
					fill: "forwards",
					easing: "ease-out",
				}
			);
			this.backwardAnim.onfinish = () => this.animateOpenBtn(leftStart);
		};
	};

	protected toggleMyIframe(show: boolean, e?: MouseEvent) {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
			Tracking.sendTracker(
				show ? "openBtn" : "closeBtn",
				INTERACTION_TYPE.click,
				e,
				(show ? "open" : "close") + " chat"
			);
		}

		if (show && !this.myIframe.src) {
			this.myIframe.setAttribute(
				"src",
				`https://dailymotionadvertising.jotform.com/agent/${this.actualProps.formId}`
			);
		}
		this.chatContainer.style.opacity = show ? "1" : "0";
		this.chatContainer.style.pointerEvents = show ? "auto" : "none";

		this.creativeProps.toggleVideo(!show);

		if (!show) {
			this.window.clearInterval(this.intervalId);
		} else if (!this.intervalId) {
			this.trackingCounter = 0;
			this.intervalId = this.window.setInterval(() => {
				this.trackingCounter += 1;
				Tracking.sendTracker(
					"AI chat is open",
					INTERACTION_TYPE.auto,
					new MouseEvent(""),
					`${this.trackingCounter * TRACKING_PERIOD}s`
				);
			}, TRACKING_PERIOD * 1000);
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
				{
					left: show
						? this.actualProps.openBtnLeftEnd
						: this.actualProps.openBtnLeftStart,
				},
			],
			{
				duration: 500,
				iterations: 1,
				fill: "forwards",
				easing: "ease-out",
			}
		);
	}

	public adResumedFromControlsCallback() {
		Tracking.sendTracker(
			INTERACTION_TARGET.videoControlsPlayBtn,
			INTERACTION_TYPE.click,
			new MouseEvent("click")
		);
		this.toggleMyIframe(false);
	}
}
