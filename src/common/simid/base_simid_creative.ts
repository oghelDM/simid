import {
	CreativeErrorCode,
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
	protected assetsPrefixUrl = "";

	private creativeData: any = {};
	private environmentData: any = {};
	protected videoState: any = {};
	private simidVersion = "";
	protected simidProtocol: SimidProtocol;
	protected root: HTMLElement;

	constructor(assetsPrefixUrl: string) {
		this.root = document.getElementById("creative-root") as HTMLElement;

		this.assetsPrefixUrl = assetsPrefixUrl;
		(window as any).assetsPrefixUrl = assetsPrefixUrl;

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
	 * Sets up the creative to send messages to the player
	 */
	protected pauseAd = () => {
		this.simidProtocol
			.sendMessage(CreativeMessage.REQUEST_PAUSE)
			.then(() => {
				console.log("Simid Creative requestPauseAd success");
			})
			.catch((err: any) => {
				console.log("Simid Creative requestPauseAd failed", err);
			});
	};

	protected playAd = () => {
		this.simidProtocol
			.sendMessage(CreativeMessage.REQUEST_PLAY)
			.then(() => {
				console.log("Simid Creative requestPlayAd success");
			})
			.catch((err: any) => {
				console.log("Simid Creative requestPlayAd failed", err);
			});
	};

	protected requestNavigation = () => {
		this.simidProtocol
			.sendMessage(CreativeMessage.REQUEST_NAVIGATION)
			.then(() => {
				console.log("Simid Creative REQUEST_NAVIGATION success");
			})
			.catch((err: any) => {
				console.log("Simid Creative REQUEST_NAVIGATION failed", err);
			});
	};

	protected skipAd = () => {
		this.simidProtocol
			.sendMessage(CreativeMessage.REQUEST_SKIP)
			.then(() => {
				console.log("Simid Creative requestSkip success");
			})
			.catch((err: any) => {
				console.log("Simid Creative requestSkip failed", err);
			});
	};

	protected stopAd = () => {
		this.simidProtocol
			.sendMessage(CreativeMessage.REQUEST_STOP)
			.then(() => {
				console.log("Simid Creative requestStop success");
			})
			.catch((err: any) => {
				console.log("Simid Creative requestStop failed", err);
			});
	};

	protected getMediaState = () => {
		this.simidProtocol
			.sendMessage(CreativeMessage.GET_MEDIA_STATE)
			.then((state: any) => {
				console.log("Simid Creative getMediaState success", state);
				console.log(
					"GET_MEDIA_STATE: ",
					JSON.stringify(state, null, 2),
				);
				// const textContent = document.querySelector(".text-content");
				// textContent.innerHTML = `<pre>${JSON.stringify(
				// 	state,
				// 	null,
				// 	2,
				// )}</pre>`;
			})
			.catch((err: any) => {
				console.log("Simid Creative getMediaState failed", err);
			});
	};

	protected log = () => {
		this.simidProtocol.sendMessage(CreativeMessage.LOG, {
			message:
				"Be you, be proud of you because you can do what you want to do",
		});
	};

	protected clickThru = (url: string) => {
		this.simidProtocol.sendMessage(CreativeMessage.CLICK_THRU, {
			x: 0,
			y: 0,
			url,
			playerHandles: true,
		});
	};

	protected mute = () => {
		this.simidProtocol
			.sendMessage(CreativeMessage.REQUEST_VOLUME, {
				volume: 0,
				muted: true,
			})
			.then(() => {
				console.log("Simid Creative REQUEST_VOLUME success");
			})
			.catch((err: any) => {
				console.log("Simid Creative REQUEST_VOLUME failed", err);
			});
	};

	protected unmute = () => {
		this.simidProtocol
			.sendMessage(CreativeMessage.REQUEST_VOLUME, {
				volume: 1,
				muted: false,
			})
			.then(() => {
				console.log("Simid Creative REQUEST_VOLUME success");
			})
			.catch((err: any) => {
				console.log("Simid Creative REQUEST_VOLUME failed", err);
			});
	};

	protected setWrongVolume = () => {
		this.simidProtocol
			.sendMessage(CreativeMessage.REQUEST_VOLUME, {
				volume: -1,
				muted: "yes",
			})
			.then(() => {
				console.log("Simid Creative REQUEST_VOLUME success");
			})
			.catch((err: any) => {
				console.log("Simid Creative REQUEST_VOLUME failed", err);
			});
	};

	protected error = () => {
		this.simidProtocol.sendMessage(CreativeMessage.FATAL_ERROR, {
			errorCode: CreativeErrorCode.TECHNICAL_ERROR,
			errorMessage: "This is a random on purpose error",
		});
	};

	protected reportTracking = () => {
		this.simidProtocol
			.sendMessage(CreativeMessage.REQUEST_TRACKING, {
				trackingUrls: [
					"https://adtester.dailymotion.com/ad-fake-event/tracker1",
					"https://adtester.dailymotion.com/ad-fake-event/tracker2",
					"https://adtester.dailymotion.com/ad-fake-event/tracker3?ps=[PLAYERSTATE]&ch=[CONTENTPLAYHEAD]&psz=[PLAYERSIZE]",
				],
			})
			.then(() => {
				console.log("Simid Creative REQUEST_TRACKING success");
			})
			.catch((err: any) => {
				console.log("Simid Creative REQUEST_TRACKING failed", err);
			});
	};

	protected changeAdDuration = () => {
		this.simidProtocol
			.sendMessage(CreativeMessage.REQUEST_CHANGE_AD_DURATION, {
				duration: 60,
			})
			.then(() => {
				console.log(
					"Simid Creative REQUEST_CHANGE_AD_DURATION success",
				);
			})
			.catch((err: any) => {
				console.log(
					"Simid Creative REQUEST_CHANGE_AD_DURATION failed",
					err,
				);
			});
	};

	protected requestFullscreen = () => {
		this.simidProtocol
			.sendMessage(CreativeMessage.REQUEST_FULL_SCREEN, {
				duration: 30,
			})
			.then(() => {
				console.log("Simid Creative REQUEST_FULL_SCREEN success");
			})
			.catch((err: any) => {
				console.log("Simid Creative REQUEST_FULL_SCREEN failed", err);
			});
	};

	protected requestExitFullscreen = () => {
		this.simidProtocol
			.sendMessage(CreativeMessage.REQUEST_EXIT_FULL_SCREEN)
			.then(() => {
				console.log("Simid Creative REQUEST_EXIT_FULL_SCREEN success");
			})
			.catch((err: any) => {
				console.log(
					"Simid Creative REQUEST_EXIT_FULL_SCREEN failed",
					err,
				);
			});
	};

	/**
	 * Sets up the creative to listen for messages from the player
	 * @private
	 */
	addListeners_() {
		this.simidProtocol.addListener(PlayerMessage.INIT, (e: any) =>
			this.onInit(e),
		);
		this.simidProtocol.addListener(PlayerMessage.START_CREATIVE, (e: any) =>
			this.onStart(e),
		);
		this.simidProtocol.addListener(PlayerMessage.FATAL_ERROR, (e: any) =>
			this.onFatalError(e),
		);
		this.simidProtocol.addListener(PlayerMessage.AD_STOPPED, (e: any) =>
			this.onAdStopped(e),
		);
		this.simidProtocol.addListener(PlayerMessage.AD_SKIPPED, (e: any) =>
			this.onAdSkipped(e),
		);
		this.simidProtocol.addListener(PlayerMessage.LOG, (e: any) =>
			this.onReceivePlayerLog(e),
		);
		this.simidProtocol.addListener(PlayerMessage.RESIZE, (e: any) =>
			this.onReceiveResize(e),
		);
		// Handlers with different video events.
		this.simidProtocol.addListener(MediaMessage.DURATION_CHANGE, (e: any) =>
			this.onDurationChange(e),
		);
		this.simidProtocol.addListener(MediaMessage.ENDED, (e: any) =>
			this.onVideoEnded(),
		);
		this.simidProtocol.addListener(MediaMessage.ERROR, (e: any) =>
			this.onVideoError(),
		);
		this.simidProtocol.addListener(MediaMessage.PAUSE, (e: any) =>
			this.onPause(),
		);
		this.simidProtocol.addListener(MediaMessage.PLAY, (e: any) =>
			this.onPlay(),
		);
		this.simidProtocol.addListener(MediaMessage.PLAYING, (e: any) =>
			this.onPlaying(),
		);
		this.simidProtocol.addListener(MediaMessage.SEEKED, (e: any) =>
			this.onSeeked(),
		);
		this.simidProtocol.addListener(MediaMessage.SEEKING, (e: any) =>
			this.onSeeking(),
		);
		this.simidProtocol.addListener(MediaMessage.TIME_UPDATE, (e: any) =>
			this.onTimeUpdate(e),
		);
		this.simidProtocol.addListener(MediaMessage.VOLUME_CHANGE, (e: any) =>
			this.onVolumeChange(e),
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
			"creative onTimeUpdate: ",
			this.videoState,
			data,
			data.args.currentTime,
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
