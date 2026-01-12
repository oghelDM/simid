import {
	CreativeMessage,
	MediaMessage,
	PlayerMessage,
	SimidProtocol,
} from "@/simid/simid_protocol";
/*
 * A subclass of a SIMID ad that implements functionality that will
 * be the same for all simid ads.
 */
export class BaseSimidCreative {
	private creativeData: any = {};
	private environmentData: any = {};
	private videoState: any = {};
	private simidVersion = "";
	private simidProtocol: any;

	private root = document.body;

	constructor() {
		/**
		 * Data about the creative, not known until after init.
		 * @protected {?Object}
		 */
		this.creativeData = null;

		/**
		 * Data about the environment the creative plays in, not known until after init.
		 * @protected {?Object}
		 */
		this.environmentData = {};

		/**
		 * The most recent video state from the player.
		 * @protected {?Object}
		 */
		this.videoState = {
			currentSrc: "",
			currentTime: -1, // Time not yet known
			duration: -1, // duration unknown
			ended: false,
			muted: false,
			paused: false,
			volume: 0.5,
			fullscreen: false,
		};

		/**
		 * The simid version, once the player makes it known.
		 * @protected {String}
		 */
		this.simidVersion = "";

		/**
		 * The protocol for sending and receiving messages.
		 * @protected {!SimidProtocol}
		 */
		this.simidProtocol = new SimidProtocol();

		this.addListeners_();
	}

	/**
	 * Sets up the creative to listen for messages from the player
	 * @private
	 */
	addListeners_() {
		this.simidProtocol.addListener(PlayerMessage.INIT, (e: any) =>
			this.onInit(e)
		);
		this.simidProtocol.addListener(PlayerMessage.START_CREATIVE, (e: any) =>
			this.onStart(e)
		);
		this.simidProtocol.addListener(PlayerMessage.FATAL_ERROR, (e: any) =>
			this.onFatalError(e)
		);
		this.simidProtocol.addListener(PlayerMessage.AD_STOPPED, (e: any) =>
			this.onAdStopped(e)
		);
		this.simidProtocol.addListener(PlayerMessage.AD_SKIPPED, (e: any) =>
			this.onAdSkipped(e)
		);
		this.simidProtocol.addListener(PlayerMessage.LOG, (e: any) =>
			this.onReceivePlayerLog(e)
		);
		this.simidProtocol.addListener(PlayerMessage.RESIZE, (e: any) =>
			this.onReceiveResize(e)
		);
		// Handlers with different video events.
		this.simidProtocol.addListener(MediaMessage.DURATION_CHANGE, (e: any) =>
			this.onDurationChange(e)
		);
		this.simidProtocol.addListener(MediaMessage.ENDED, (e: any) =>
			this.onVideoEnded()
		);
		this.simidProtocol.addListener(MediaMessage.ERROR, (e: any) =>
			this.onVideoError()
		);
		this.simidProtocol.addListener(MediaMessage.PAUSE, (e: any) =>
			this.onPause()
		);
		this.simidProtocol.addListener(MediaMessage.PLAY, (e: any) =>
			this.onPlay()
		);
		this.simidProtocol.addListener(MediaMessage.PLAYING, (e: any) =>
			this.onPlaying()
		);
		this.simidProtocol.addListener(MediaMessage.SEEKED, (e: any) =>
			this.onSeeked()
		);
		this.simidProtocol.addListener(MediaMessage.SEEKING, (e: any) =>
			this.onSeeking()
		);
		this.simidProtocol.addListener(MediaMessage.TIME_UPDATE, (e: any) =>
			this.onTimeUpdate(e)
		);
		this.simidProtocol.addListener(MediaMessage.VOLUME_CHANGE, (e: any) =>
			this.onVolumeChange(e)
		);
	}

	ready() {
		this.simidProtocol.createSession();
	}

	/**
	 * Receives init message from the player.
	 * @param {!Object} eventData Data from the event.
	 * @protected
	 */
	onInit(eventData: any) {
		this.updateInternalOnInit(eventData);
		this.simidProtocol.resolve(eventData, {});
	}

	/**
	 * Updates internal data on initialization call.
	 *
	 * Note: When overriding the onInit function and not wishing
	 * to always resolve, subclasses may instead use this function.
	 * @param {!Object} eventData Data from the event.
	 * @protected
	 */
	updateInternalOnInit(eventData: any) {
		this.creativeData = eventData.args.creativeData;
		this.environmentData = eventData.args.environmentData;
		this.videoState.muted = this.environmentData.muted;
		this.videoState.volume = this.environmentData.volume;
	}

	/**
	 * Receives start message from the player.
	 * @param {!Object} eventData Data from the event.
	 * @protected
	 */
	onStart(eventData: any) {
		// Acknowledge that the ad is started.
		console.log("Simid creative started.");
		return this.simidProtocol.resolve(eventData, {});
	}

	/**
	 * Called when the creative receives the fatal error message from the player.
	 * @protected
	 */
	onFatalError(eventData: any) {
		// After resolving the iframe with this ad should be cleaned up.
		this.simidProtocol.resolve(eventData, {});
	}

	/**
	 * Called when the creative receives the stop message from the player.
	 * @protected
	 */
	onAdStopped(eventData: any) {
		// After resolving the iframe with this ad should be cleaned up.
		this.simidProtocol.resolve(eventData, {});
	}

	/**
	 * Called when the creative receives the skip message from the player.
	 * @protected
	 */
	onAdSkipped(eventData: any) {
		// After resolving the iframe with this ad should be cleaned up.
		this.simidProtocol.resolve(eventData, {});
	}

	/**
	 * Called when the creative receives a resize message from the player.
	 * @param {!Object} eventData Data from the event.
	 * @protected
	 */
	onReceiveResize(eventData: any = {}) {
		this.environmentData.creativeDimensions =
			eventData.args?.creativeDimensions;
		this.environmentData.videoDimensions = eventData.args?.videoDimensions;
	}

	/**
	 * Opens the click through url and lets the player know about it.
	 * @protected
	 */
	clickThru() {}

	/**
	 * Asks the player for the state of the video element.
	 * @protected
	 */
	fetchMediaState() {
		this.simidProtocol
			.sendMessage(CreativeMessage.GET_MEDIA_STATE, {})
			.then((data: any) => this.onGetMediaStateResolve(data));
	}

	/**
	 * @protected
	 */
	onGetMediaStateResolve(data: any) {
		this.videoState = data;
	}

	/**
	 * @protected
	 */
	onDurationChange(data: any) {
		this.videoState.duration = data.args.duration;
	}

	/**
	 * @protected
	 */
	onVideoEnded() {
		this.videoState.ended = true;
	}

	/**
	 * @protected
	 */
	onVideoError() {
		// no op for this example
	}

	/**
	 * @protected
	 */
	onPause() {
		this.videoState.paused = true;
	}

	/**
	 * @protected
	 */
	onPlay() {
		this.videoState.paused = false;
	}

	/**
	 * @protected
	 */
	onPlaying() {
		this.videoState.paused = false;
	}

	/**
	 * @protected
	 */
	onSeeked() {
		// no op for this example
	}

	/**
	 * @protected
	 */
	onSeeking() {
		// no op for this example
	}

	/**
	 * @protected
	 */
	onTimeUpdate(data: any) {
		console.log(
			"onTimeUpdate: ",
			this.videoState,
			data,
			data.args.currentTime
		);
		this.videoState.currentTime = data.args.currentTime;
	}

	/**
	 * @protected
	 */
	onVolumeChange(data: any) {
		console.log("onVolumeChange");
		this.videoState.volume = data.args.volume;
	}

	onReceivePlayerLog(data: any) {
		const logMessage = data.args.message;
		console.log("Received message from player: " + logMessage);
	}

	/**
	 * Sends message requesting to resize creative based off of given resizeParameters
	 * @param {!Object} resizeParams An object with the video & creative dimensions.
	 */
	requestResize(resizeParams: any) {
		this.simidProtocol
			.sendMessage(CreativeMessage.REQUEST_RESIZE, resizeParams)
			.then(() => {
				this.environmentData.creativeDimensions =
					resizeParams.creativeDimensions;
				this.environmentData.videoDimensions =
					resizeParams.videoDimensions;
			});
	}
}
