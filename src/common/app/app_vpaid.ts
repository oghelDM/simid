import { LiveStreamData } from "@/types";
import { createDiv } from "@/utils/divMaker";
import { Creative, CreativeProps } from "@/creative";
import { isMac, pickVideo, updateDisplay } from "@/utils/helper";

const quartileEvents = [
	{ event: "AdImpression", value: 0 },
	{ event: "AdVideoStart", value: 0 },
	{ event: "AdVideoFirstQuartile", value: 25 },
	{ event: "AdVideoMidpoint", value: 50 },
	{ event: "AdVideoThirdQuartile", value: 75 },
	{ event: "AdVideoComplete", value: 100 },
];

interface IMyClass {
	new (root: HTMLElement, creativeProps: CreativeProps): Creative;
}

let CreativeClass: IMyClass;

export class VPAIDVideoPlayer {
	attributes: any = {
		companions: "",
		desiredBitrate: 256,
		// duration: 20,
		expanded: false,
		height: 0,
		icons: "",
		linear: true,
		// remainingTime: 20,
		skippableState: true,
		viewMode: "normal",
		width: 0,
		volume: 1.0,
	}; // TODO: strongly type?
	slot: HTMLElement;
	creativeData: any;
	videoSlot: HTMLVideoElement;
	liveStreamData: LiveStreamData | undefined;
	eventsCallbacks: any = {}; // TODO: strongly type
	time = 0; // time to update the liveStream progress bar if needed
	previousTime = 0; // time to update the liveStream progress bar if needed

	// TODO: clean this up
	nextQuartileIndex = 0;
	// A creativeWrapper to keep the creative content centered
	creativeWrapper: HTMLElement;
	// A container dedicated to the creative
	creativeRoot: HTMLElement;

	creative: Creative;

	constructor(_CreativeClass: IMyClass) {
		CreativeClass = _CreativeClass;
	}

	/**
	 * Creates or updates the video slot and fills it with a supported video.
	 * @private
	 */
	updateVideoSlot = () => {
		if (this.videoSlot == null) {
			this.videoSlot = document.createElement("video");
			this.log(
				"Warning: No video element passed to ad, creating element."
			);
			this.slot.appendChild(this.videoSlot);
		}
		this.updateVideoPlayerSize();

		if (!this.creative) {
			////////////////////////////////////////////////////////////////////
			///////////////////// DM ad instanciation //////////////////////////
			////////////////////////////////////////////////////////////////////
			this.creative = new CreativeClass(this.creativeRoot, {
				videoSlot: this.videoSlot,
				onClick: (url: string) => this.clickAd(url),
				stopAd: () => this.stopAd(),
				pauseAd: () => this.pauseAd(),
				resumeAd: () => this.resumeAd(),
				setAdVolume: (volume: number) => this.setAdVolume(volume),
				toggleVideo: (playVideo: boolean) =>
					this.toggleVideo(playVideo),
				adParameters: this.creativeData["AdParameters"],
			});
			////////////////////////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////
		}
		this.liveStreamData = this.creative.getLiveStreamData();
		if (this.liveStreamData) {
			this.loadVideoStream(
				this.liveStreamData.url,
				this.liveStreamData.Hls
			);
		} else {
			this.playVideoFile();
		}
	};

	playVideoFile = () => {
		this.liveStreamData = undefined;

		const { low, mid, high } = this.creative.getVideos();

		const videos = [
			{
				mimeType: "video/mp4",
				width: 853,
				height: 480,
				url: low,
			},
			{
				mimeType: "video/mp4",
				width: 1280,
				height: 720,
				url: mid,
			},
			{
				mimeType: "video/mp4",
				width: 1920,
				height: 1080,
				url: high,
			},
		];

		const selectedMedia = pickVideo(videos, this.videoSlot);

		if (!selectedMedia) {
			// Unable to find a source video.
			console.error(
				"video source was not found: check media mimetype and valid URL"
			);
			this.callEvent("AdError");
		} else {
			this.videoSlot.src = selectedMedia.url;
		}
	};

	loadVideoStream = (streamUrl: string, Hls: any) => {
		if (streamUrl.includes("dailymotion.com")) {
			try {
				fetch(streamUrl)
					.then((response) => {
						if (response.ok) {
							return response.json();
						}
						throw new Error(
							"Something went wrong while fetching the DM stream"
						);
					})
					.then((data) => data.qualities.auto[0].url)
					.then((liveLink: string) =>
						this.playVideoStream(liveLink, Hls)
					);
			} catch {
				this.log("error while loading the DM stream");
				this.playVideoFile();
			}
		} else {
			this.playVideoStream(streamUrl, Hls);
		}
	};

	playVideoStream = (streamUrl: string, Hls: any) => {
		try {
			if (Hls.isSupported()) {
				const hls = new Hls();
				hls.on(Hls.Events.MEDIA_ATTACHED, () =>
					console.log("video and hls.js are now bound together !")
				);
				hls.on(Hls.Events.MANIFEST_PARSED, (_: any, data: any) =>
					console.log(
						`manifest loaded, found ${data.levels.length} quality level`
					)
				);
				hls.loadSource(streamUrl);
				hls.attachMedia(this.videoSlot);
			} else if (isMac()) {
				this.videoSlot.src = streamUrl;
				this.videoSlot.play();
			} else {
				this.playVideoFile();
			}
		} catch {
			this.log("error while loading the stream");
			this.playVideoFile();
		}
	};

	// TODO?
	updateInteractiveSlot = () => {};

	callEvent = (eventName: string) => {
		if (eventName in this.eventsCallbacks) {
			this.eventsCallbacks[eventName]();
		}
	};

	/**
	 * Called when the ad is clicked.
	 * @private
	 */
	clickAd = (url: string) => {
		// console.log("clickAd:", url);

		if ("AdClickThru" in this.eventsCallbacks) {
			this.eventsCallbacks["AdClickThru"](url, "0", true);
		}
	};

	/**
	 * Called by the video element when video metadata is loaded.
	 * @private
	 */
	loadedMetadata = () => {
		// The ad duration is not known until the media metadata is loaded.
		// Then, update the player with the duration change.
		this.attributes["duration"] = this.liveStreamData
			? this.liveStreamData.duration
			: this.videoSlot.duration;
		this.attributes["remainingTime"] = this.attributes["duration"];
		this.callEvent("AdDurationChange");

		// allows to re-trigger the quartile events when changing the videoSlot src
		// make sure that the AdImpression evet is triggered only once
		if (this.nextQuartileIndex > 0) {
			this.nextQuartileIndex = 1;
		}
	};

	/**
	 * Called by the video element when the video reaches specific points during
	 * playback.
	 * @private
	 */
	timeUpdateHandler = () => {
		if (this.liveStreamData && this.attributes.remainingTime <= 0) {
			this.pauseAd();
			this.stopAd();
			return;
		}

		if (this.nextQuartileIndex >= quartileEvents.length) {
			return;
		}

		if (!this.previousTime) {
			this.previousTime = new Date().getTime();
		}
		const now = new Date().getTime();
		this.time += now - this.previousTime;
		this.previousTime = now;

		const currentTime = this.liveStreamData
			? this.time / 1000
			: this.videoSlot.currentTime;
		const duration = this.liveStreamData
			? this.liveStreamData.duration
			: this.videoSlot.duration;

		let percentPlayed = (currentTime * 100.0) / duration;
		// prevents the JS floating rounding error (99.999999999%)
		percentPlayed = Math.round(percentPlayed * 100) / 100;

		this.creative.videoTimeUpdate(percentPlayed);
		if (percentPlayed >= quartileEvents[this.nextQuartileIndex].value) {
			const lastQuartileEvent =
				quartileEvents[this.nextQuartileIndex].event;
			this.nextQuartileIndex += 1;
			this.eventsCallbacks[lastQuartileEvent] &&
				this.eventsCallbacks[lastQuartileEvent]();
		}

		if (duration > 0) {
			this.attributes.duration = duration;
			this.attributes.remainingTime = duration - currentTime;
		}
	};

	/**
	 * Helper function to update the size of the video player.
	 * @private
	 */
	updateVideoPlayerSize = () => {
		this.videoSlot.setAttribute("width", this.attributes["width"]);
		this.videoSlot.setAttribute("height", this.attributes["height"]);
	};

	/**
	 * Logs events and messages.
	 * @param {string} message
	 */
	log = (message: string) => console.log(message);

	//////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////
	//////////////////////// VPAID INTERFACE /////////////////////////////
	//////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////

	/**
	 * Returns the supported VPAID version.
	 * @param {string} playerVPAIDVersion
	 * @return {string}
	 */
	handshakeVersion = (_: any) => "2.0";

	/**
	 * Initializes all attributes in the ad. The ad will not start until startAd is called.
	 * @param {number} width The ad width.
	 * @param {number} height The ad height.
	 * @param {string} viewMode The ad view mode.
	 * @param {number} desiredBitrate The chosen bitrate.
	 * @param {Object} creativeData Data associated with the creative.
	 * @param {Object} environmentVars Runtime variables associated with the creative like the slot and video slot.
	 */
	initAd = (
		width: any,
		height: any,
		viewMode: any,
		desiredBitrate: any,
		creativeData: any,
		environmentVars: { slot: HTMLElement; videoSlot: HTMLVideoElement }
	) => {
		// TODO: do we need to keep this attributes Object?
		this.attributes["width"] = width;
		this.attributes["height"] = height;
		this.attributes["viewMode"] = viewMode;
		this.attributes["desiredBitrate"] = desiredBitrate;

		this.creativeData = creativeData;

		this.creativeWrapper = createDiv("creativeWrapper", {
			position: "absolute",
			display: "flex",
			flexDirection: "column",
			justifyContent: "center",
			width: "100%",
			height: "100%",
		});

		this.creativeRoot = createDiv("creative-root", {
			position: "relative",
			overflow: "hidden",
			aspectRatio: "16 / 9",
			margin: "auto",
			translate: "translateZ(0)", // prevents a weird chrome position bug with videoControls after an animation is played :/
		});
		updateDisplay(this.creativeRoot);

		// slot and videoSlot are passed as part of the environmentVars
		this.slot = environmentVars.slot;
		this.videoSlot = environmentVars.videoSlot;

		this.creativeWrapper.appendChild(this.creativeRoot);
		this.slot.appendChild(this.creativeWrapper);

		this.updateVideoSlot();

		this.videoSlot.addEventListener("timeupdate", () =>
			this.timeUpdateHandler()
		);
		this.videoSlot.addEventListener("loadedmetadata", () =>
			this.loadedMetadata()
		);
		this.videoSlot.addEventListener("ended", () => this.stopAd());

		// expected VPAID callback
		this.callEvent("AdLoaded");
	};

	/**
	 * Called by the wrapper to start the ad.
	 */
	startAd = () => {
		this.log("Starting ad");
		this.videoSlot.play();
		// this.updateInteractiveSlot();// TODO

		this.callEvent("AdStarted");
	};

	/**
	 * Called by the wrapper to stop the ad.
	 */
	stopAd = () => {
		this.log("Stopping ad");
		// Calling AdStopped immediately terminates the ad. Setting a timeout allows
		// events to go through.
		var callback = this.callEvent.bind(this);
		setTimeout(callback, 75, ["AdStopped"]);
	};

	/**
	 * Called when the video player changes the width/height of the container.
	 * @param {number} width The new width.
	 * @param {number} height A new height.
	 * @param {string} viewMode A new view mode.
	 */
	resizeAd = (width: any, height: any, viewMode: any) => {
		// this.log("resizeAd " + width + "x" + height + " " + viewMode);
		this.attributes["width"] = width;
		this.attributes["height"] = height;
		this.attributes["viewMode"] = viewMode;
		this.updateVideoPlayerSize();
		updateDisplay(this.creativeRoot);
		this.callEvent("AdSizeChange");

		// triggers the components resize
		window.dispatchEvent(new Event("resize"));
	};

	/**
	 * Pauses the ad.
	 */
	pauseAd = () => {
		// this.log("pauseAd");
		if (!this.creative.canPauseVideo) {
			return;
		}
		this.videoSlot.pause();
		this.callEvent("AdPaused");
		this.creative.adPausedFromControlsCallback();
	};

	/**
	 * Resumes the ad.
	 */
	resumeAd = () => {
		if (!this.creative.canResumeVideo) {
			return;
		}
		this.videoSlot.play();
		this.callEvent("AdPlaying");
		this.previousTime = new Date().getTime();
		this.creative.adResumedFromControlsCallback();
	};

	/**
	 * Expands the ad.
	 */
	expandAd = () => {
		// this.log("expandAd");
		this.attributes["expanded"] = true;
		this.callEvent("AdExpandedChange");
	};

	/**
	 * Collapses the ad.
	 */
	collapseAd = () => {
		this.attributes["expanded"] = false;
		this.callEvent("AdExpandedChange");
	};

	/**
	 * Skips the ad.
	 */
	skipAd = () => {
		var skippableState = this.attributes["skippableState"];
		if (skippableState) {
			this.callEvent("AdSkipped");
		}
	};

	/**
	 * Registers a callback for an event.
	 * @param {Function} callBack The callback function.
	 * @param {string} eventName The callback type.
	 * @param {Object} aContext The context for the callback.
	 */
	subscribe = (
		callBack: { bind: (arg0: any) => any },
		eventName: string,
		aContext: any
	) => {
		// console.log("Subscribe " + eventName);
		const bindedCallBack = callBack.bind(aContext);
		this.eventsCallbacks[eventName] = bindedCallBack;
	};

	/**
	 * Removes a callback based on the eventName.
	 * @param {string} eventName The callback type.
	 */
	unsubscribe = (eventName: string) => {
		// console.log("unsubscribe " + eventName);
		this.eventsCallbacks[eventName] = null;
	};

	/**
	 * Returns whether the ad is linear.
	 * @return {boolean} True if the ad is linear, False for non linear.
	 */
	getAdLinear = () => this.attributes["linear"];

	// TODO: is this function necessary? Not present in VPAID documentation
	/**
	 * Returns ad width.
	 * @return {number} The ad width.
	 */
	getAdWidth = () => this.attributes["width"];

	// TODO: is this function necessary? Not present in VPAID documentation
	/**
	 * Returns ad height.
	 * @return {number} The ad height.
	 */
	getAdHeight = () => this.attributes["height"];

	/**
	 * Returns true if the ad is expanded.
	 * @return {boolean}
	 */
	getAdExpanded = () => this.attributes["expanded"];

	/**
	 * Returns the skippable state of the ad.
	 * @return {boolean}
	 */
	getAdSkippableState = () => this.attributes["skippableState"];

	/**
	 * Returns the remaining ad time, in seconds.
	 * @return {number} The time remaining in the ad.
	 */
	getAdRemainingTime = () => this.attributes["remainingTime"];

	// TODO: put this to the actual video remaining time?
	/**
	 * Returns the duration of the ad, in seconds.
	 * @return {number} The duration of the ad.
	 */
	getAdDuration = () => this.attributes["duration"];

	/**
	 * Returns the ad volume.
	 * @return {number} The volume of the ad.
	 */
	getAdVolume = () => {
		// this.log("getAdVolume");
		return this.attributes["volume"];
	};

	/**
	 * Sets the ad volume.
	 * @param {number} value The volume in percentage.
	 */
	setAdVolume = (value: any) => {
		// this.log("setAdVolume " + value);
		this.videoSlot.volume = value;
		this.videoSlot.muted = value === 0;
		this.attributes["volume"] = value;
		this.callEvent("AdVolumeChange");
	};

	// TODO: is this function necessary? Not present in VPAID documentation
	/**
	 * Returns a list of companion ads for the ad.
	 * @return {string} List of companions in VAST XML.
	 */
	getAdCompanions = () => this.attributes["companions"];

	// TODO: is this function necessary? Not present in VPAID documentation
	/**
	 * Returns a list of icons.
	 * @return {string} A list of icons.
	 */
	getAdIcons = () => this.attributes["icons"];

	///////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////

	// Home-made, toggles the video play/pause from the Creative
	toggleVideo = (playVideo: boolean) => {
		if (playVideo) {
			this.videoSlot.play();
			this.callEvent("AdPlaying");
			this.previousTime = new Date().getTime();
		} else {
			this.videoSlot.pause();
			this.callEvent("AdPaused");
		}
	};
}
