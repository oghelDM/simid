import {
	INTERACTION_TARGET,
	INTERACTION_TYPE,
	Tracking,
} from "@/utils/tracking";
import { CssType } from "@/types";
import { ImageDM } from "@/components/image";
import { createDiv } from "@/utils/divMaker";
import { Creative, CreativeProps } from "@/creative";
import { HotSpotProduct, hotSpotsTemplate } from "./HotSpots";

interface FrameProps {
	videoProgress: number; // video percentage progress when the card should be added to the screen
	bgUrl: string;
	thumbnailUrl: string;
	products: HotSpotProduct[];
}

export interface ViewShopProps {
	clickUrl: string; // redirection click url
	framesProps: FrameProps[];
	cardStyle?: CssType; // css style to override the card style
	hotspotStyle?: CssType; // css style to override the hotspot style
	panelStyle?: CssType; // css style to override the panel style
	panelButtonStyle?: CssType; // css style to override the panel +/- button style
	focusedThumbnailOutlineStyle?: string; // css outline style to override the thumbnail focused style
	panelButtonOnUrl?: string; // background image for the 'on' (+) button
	panelButtonOffUrl?: string; // background image for the 'of' (-) button
	hotSpotUrl: string; // hotspot style bg image
	inactivityTimeoutDuration?: number;
}

const defaultProps: Required<ViewShopProps> = {
	clickUrl: "https://www.dailymotion.fr",
	hotSpotUrl:
		"https://statics.dmcdn.net/d/devTools/assets/hotSpots/hotspot.png",
	framesProps: [
		{
			videoProgress: 8,
			bgUrl: "https://plus.unsplash.com/premium_photo-1706896055883-880d1710dc2f?q=80&w=402&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
			thumbnailUrl:
				"https://plus.unsplash.com/premium_photo-1706896055883-880d1710dc2f?q=80&w=402&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
			products: [
				{
					clickUrl: "https://www.google.fr?q=product0",
					productUrl:
						"https://statics.dmcdn.net/d/devTools/assets/hotSpots/product0.png",
					spotLeft: "94%",
					spotTop: "33%",
					cardLeft: "66%",
					cardTop: "16%",
				},
			],
		},
	],
	panelButtonOnUrl:
		"https://statics.dmcdn.net/d/devTools/assets/viewShop/btnOn.png",
	panelButtonOffUrl:
		"https://statics.dmcdn.net/d/devTools/assets/viewShop/btnOff.png",
	inactivityTimeoutDuration: 3000,
	cardStyle: {},
	hotspotStyle: {},
	panelStyle: {},
	panelButtonStyle: {},
	focusedThumbnailOutlineStyle: "0.5vw solid white",
};

export class ViewShopTemplate extends Creative {
	private actualProps: Required<ViewShopProps>;
	private currPair:
		| { frame: HTMLElement; thumbnail: HTMLElement; index: number }
		| undefined; // the current frame and thumbnail, if any
	private inactivityTimeout: number;
	private leftPanel: HTMLElement;
	private panelButton: HTMLElement;
	private container: HTMLElement;
	private subContainer: HTMLElement;
	private downArrow: HTMLElement;
	private playBtn: HTMLElement;
	private frames: ImageDM[];
	private thumbnails: ImageDM[];
	private startTrackingTime: Date | undefined;

	constructor(
		root: HTMLElement,
		creativeProps: CreativeProps,
		viewShopProps: ViewShopProps
	) {
		super(root, creativeProps);
		this.init(viewShopProps);
	}

	private init(viewShopProps: ViewShopProps) {
		this.actualProps = {
			...defaultProps,
			...viewShopProps,
		};

		this.leftPanel = createDiv("left-panel", {
			position: "absolute",
			flexDirection: "row",
			width: "20%",
			height: "100%",
			left: "-20%",
			top: "0",
			transition: "left .6s",
		});
		this.container = createDiv("panel-container", {
			position: "absolute",
			width: "100%",
			height: "100%",
			backgroundColor: "rgba(0,0,0,.7)",
			...viewShopProps.panelStyle,
		});
		this.subContainer = createDiv("panel-subcontainer", {
			width: "100%",
			height: "85%",
			overflow: "scroll",
			scrollbarWidth: "none",
		});
		this.downArrow = new ImageDM(
			"panel-down-arrow",
			"https://statics.dmcdn.net/d/devTools/assets/viewShop/arrow_down.png",
			{
				height: "2%",
				backgroundSize: "contain",
				opacity: "0",
				transition: "opacity .6s",
			}
		);
		this.panelButton = new ImageDM(
			"panel-button",
			this.actualProps.panelButtonOffUrl,
			{
				width: "20%",
				aspectRatio: "1 / 1",
				height: "unset",
				left: "100%",
				top: "40%",
				cursor: "pointer",
				pointerEvents: "none",
				opacity: "0",
				transition: "background-image 0.5s",
				...viewShopProps.panelButtonStyle,
			}
		);
		this.container.appendChild(this.subContainer);
		this.container.appendChild(this.downArrow);
		this.leftPanel.appendChild(this.container);
		this.leftPanel.appendChild(this.panelButton);

		const { clickUrl, framesProps, hotSpotUrl } = this.actualProps;

		this.frames = framesProps.map(({ bgUrl, products }, i) => {
			const frame = new ImageDM(`frame_${i}`, "", {
				left: "-100%",
				transition: "left .6s",
			});
			hotSpotsTemplate(frame, this.creativeProps, {
				bgUrl,
				clickUrl,
				hotSpotUrl,
				products,
				cardStyle: viewShopProps.cardStyle,
				hotspotStyle: viewShopProps.hotspotStyle,
			});
			this.root.appendChild(frame);
			return frame;
		});

		this.panelButton.addEventListener("mouseenter", (e: MouseEvent) => {
			const isPanelHidden = this.leftPanel.style.left !== "0%";
			if (isPanelHidden) {
				this.togglePanel(e);
			}
		});

		this.panelButton.addEventListener("click", (e: PointerEvent) => {
			e.preventDefault();
			e.stopPropagation();
			this.togglePanel(e);
		});

		// hide the current frame if any and resume the video when the user does not interact for some time
		this.root.addEventListener("pointermove", () => {
			this.window.clearTimeout(this.inactivityTimeout);
			this.inactivityTimeout = this.window.setTimeout(
				() => this.hideCurrFrame(),
				this.actualProps.inactivityTimeoutDuration
			);
		});

		this.thumbnails = framesProps.map(({ thumbnailUrl }, i) => {
			const thumbnail = new ImageDM(`thumbnail_${i}`, thumbnailUrl, {
				position: "unset",
				width: "90%",
				aspectRatio: "16 / 9",
				height: "0%", // allows to hide the thumbnail until it is displayed
				margin: "5% 5%",
				cursor: "pointer",
				opacity: "0",
				transition: "opacity .6s .3s, outline .4s",
				pointerEvents: "none",
			});
			thumbnail.addEventListener("click", (e) => {
				e.preventDefault();
				e.stopPropagation();

				const nextPair = {
					frame: this.frames[i],
					thumbnail: this.thumbnails[i],
					index: i,
				};
				if (this.currPair === nextPair) {
					return;
				}

				// hide current frame if any
				this.hideCurrFrame();

				nextPair.frame.style.left = "0%";
				nextPair.thumbnail.style.outline =
					this.actualProps.focusedThumbnailOutlineStyle;
				this.currPair = nextPair;

				this.playBtn.style.opacity = "1";
				this.playBtn.style.pointerEvents = "auto";

				this.creativeProps.toggleVideo(false);

				this.startTrackingTime = new Date();

				Tracking.sendTracker(
					`thumbnail-${i}`,
					INTERACTION_TYPE.click,
					e
				);
			});
			this.subContainer.appendChild(thumbnail);

			return thumbnail;
		});

		this.root.appendChild(this.leftPanel);

		this.playBtn = new ImageDM(
			"playBtn",
			"https://statics.dmcdn.net/d/devTools/assets/viewShop/play.png",
			{
				width: "10%",
				left: "86%",
				top: "40%",
				aspectRatio: "1 / 1",
				height: "auto",
				opacity: "0",
				transition: "opacity .6s",
				cursor: "pointer",
				pointerEvents: "none",
			}
		);
		this.playBtn.addEventListener("click", (e) => {
			e.preventDefault();
			e.stopPropagation();
			this.hideCurrFrame();
			Tracking.sendTracker("playBtn", INTERACTION_TYPE.click, e);
		});
		this.root.appendChild(this.playBtn);
	}

	private hideCurrFrame = (isFromVideoControls = false) => {
		if (!this.currPair) {
			return;
		}

		this.thumbnails.forEach((t) => (t.style.outline = "unset"));

		const { frame, index } = this.currPair;
		frame.style.left = "-100%";
		this.currPair = undefined;

		this.playBtn.style.opacity = "0";
		this.playBtn.style.pointerEvents = "none";

		if (!isFromVideoControls) {
			this.creativeProps.toggleVideo(true);
		}

		let trackingMessage;
		if (this.startTrackingTime) {
			const endTrackingTime = new Date();
			const cardDuration =
				(endTrackingTime.getTime() - this.startTrackingTime.getTime()) /
				1000;
			trackingMessage = `${cardDuration}`;
			this.startTrackingTime = undefined;
		}
		Tracking.sendTracker(
			`frame-${index}`,
			INTERACTION_TYPE.close,
			new MouseEvent("click"),
			trackingMessage
		);
	};

	private togglePanel = (e?: MouseEvent | PointerEvent) => {
		const isPanelHidden = this.leftPanel.style.left !== "0%";
		this.leftPanel.style.left = isPanelHidden ? "0%" : "-20%";
		this.panelButton.style.backgroundImage = `url(${
			isPanelHidden
				? this.actualProps.panelButtonOffUrl
				: this.actualProps.panelButtonOnUrl
		})`;
		if (!e) {
			this.panelButton.style.opacity = "1";
			this.panelButton.style.pointerEvents = "auto";
		} else {
			Tracking.sendTracker("panelButton", INTERACTION_TYPE.click, e);
		}
	};

	// called everytime the video time is updated
	public videoTimeUpdate(progressPercent: number): void {
		super.videoTimeUpdate(progressPercent);

		this.actualProps.framesProps.forEach(({ videoProgress }, i) => {
			const thumbnail = this.thumbnails[i];
			if (
				progressPercent > videoProgress &&
				thumbnail.style.height === "0%"
			) {
				thumbnail.style.height = "unset";
				thumbnail.style.opacity = "1";
				thumbnail.style.pointerEvents = "auto";
				if (i > 3) {
					this.downArrow.style.opacity = "1";
					this.subContainer.scroll({
						top: this.subContainer.scrollHeight,
						behavior: "smooth",
					});
				}

				if (i === 0) {
					this.togglePanel(); // force the panel display for the first time
				}
			}
		});
	}

	public adResumedFromControlsCallback() {
		this.hideCurrFrame(true);
		Tracking.sendTracker(
			INTERACTION_TARGET.videoControlsPlayBtn,
			INTERACTION_TYPE.click,
			new MouseEvent("click")
		);
	}
}
