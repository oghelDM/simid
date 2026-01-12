import { LiveStreamData } from "./types";
import { Tracking } from "./utils/tracking";
import { CACHE_QUERY } from "./components/image";
import { InsightTimer } from "./components/InsightTimer";

export interface CreativeProps {
	videoSlot: HTMLVideoElement;
	onClick: (url: string) => void;
	stopAd: () => void;
	pauseAd: () => void;
	resumeAd: () => void;
	setAdVolume: (volume: number) => void;
	toggleVideo: (playVideo: boolean) => void;
	adParameters: string;
	isLumen?: boolean;
}

export class Creative extends HTMLElement {
	public canResumeVideo = true; // allows the creative to prevent the user from resuming the ad through the play button
	public canPauseVideo = true; // allows the creative to prevent the user from pausing the ad through the pause button

	protected window: Window & typeof globalThis;

	protected insightTimer: InsightTimer;
	protected assetsPrefixUrl: string;

	constructor(
		protected root: HTMLElement,
		protected creativeProps: CreativeProps
	) {
		super();

		const boxDocument = root.ownerDocument;
		this.window =
			boxDocument.defaultView || (boxDocument as any).parentWindow;

		if (creativeProps.isLumen) {
			this.insightTimer = new InsightTimer();
		}

		Tracking.init(creativeProps.adParameters);
	}

	public getVideos() {
		return {
			low: `${this.assetsPrefixUrl}video_low.mp4${CACHE_QUERY}`,
			mid: `${this.assetsPrefixUrl}video_mid.mp4${CACHE_QUERY}`,
			high: `${this.assetsPrefixUrl}video_high.mp4${CACHE_QUERY}`,
		};
	}

	public getLiveStreamData(): LiveStreamData | undefined {
		return undefined;
	}

	// called everytime the video time is updated
	public videoTimeUpdate(_: number): void {
		if (!this.insightTimer) {
			return;
		}

		const currentTime = this.creativeProps.videoSlot.currentTime;
		const duration = this.creativeProps.videoSlot.duration;

		if (isNaN(currentTime) || isNaN(duration)) {
			return;
		}
		this.insightTimer.innerHTML = `0:${Math.round(duration - currentTime)}`;
	}

	// called when the video is resumed from the video controls (user action)
	public adResumedFromControlsCallback(): void {}

	// called when the video is paused from the video controls (user action)
	public adPausedFromControlsCallback(): void {}
}
