class SimidDebug extends BaseSimidCreative {
	constructor() {
		super();

		document.getElementById("requestPause").onclick = () => this.pauseAd();
		document.getElementById("requestPlay").onclick = () => this.playAd();
		document.getElementById("requestMute").onclick = () => this.mute();
		document.getElementById("requestUnmute").onclick = () => this.unmute();
		document.getElementById("clickThru").onclick = () => this.clickThru();
		document.getElementById("setWrongVolume").onclick = () =>
			this.setWrongVolume();
		document.getElementById("error").onclick = () => this.error();
		document.getElementById("requestSkip").onclick = () => this.skipAd();
		document.getElementById("requestStop").onclick = () => this.stopAd();
		document.getElementById("requestFullscreen").onclick = () =>
			this.requestFullscreen();
		document.getElementById("requestExitFullscreen").onclick = () =>
			this.requestExitFullscreen();
		document.getElementById("log").onclick = () => this.log();
		document.getElementById("reportTracking").onclick = () =>
			this.reportTracking();
		document.getElementById("changeAdDuration").onclick = () =>
			this.changeAdDuration();
		document.getElementById("getMediaState").onclick = () =>
			this.getMediaState();
		document.getElementById("requestNavigation").onclick = () =>
			this.requestNavigation();
	}

	pauseAd() {
		this.simidProtocol
			.sendMessage(CreativeMessage.REQUEST_PAUSE)
			.then(() => {
				console.log("Simid Creative requestPauseAd success");
			})
			.catch((err) => {
				console.log("Simid Creative requestPauseAd failed", err);
			});
	}
	playAd() {
		this.simidProtocol
			.sendMessage(CreativeMessage.REQUEST_PLAY)
			.then(() => {
				console.log("Simid Creative requestPlayAd success");
			})
			.catch((err) => {
				console.log("Simid Creative requestPlayAd failed", err);
			});
	}
	requestNavigation() {
		this.simidProtocol
			.sendMessage(CreativeMessage.REQUEST_NAVIGATION)
			.then(() => {
				console.log("Simid Creative REQUEST_NAVIGATION success");
			})
			.catch((err) => {
				console.log("Simid Creative REQUEST_NAVIGATION failed", err);
			});
	}
	skipAd() {
		this.simidProtocol
			.sendMessage(CreativeMessage.REQUEST_SKIP)
			.then(() => {
				console.log("Simid Creative requestSkip success");
			})
			.catch((err) => {
				console.log("Simid Creative requestSkip failed", err);
			});
	}
	stopAd() {
		this.simidProtocol
			.sendMessage(CreativeMessage.REQUEST_STOP)
			.then(() => {
				console.log("Simid Creative requestStop success");
			})
			.catch((err) => {
				console.log("Simid Creative requestStop failed", err);
			});
	}

	getMediaState() {
		this.simidProtocol
			.sendMessage(CreativeMessage.GET_MEDIA_STATE)
			.then((state) => {
				console.log("Simid Creative getMediaState success", state);
				const textContent = document.querySelector(".text-content");
				textContent.innerHTML = `<pre>${JSON.stringify(
					state,
					null,
					2
				)}</pre>`;
			})
			.catch((err) => {
				console.log("Simid Creative getMediaState failed", err);
			});
	}
	log() {
		this.simidProtocol.sendMessage(CreativeMessage.LOG, {
			message:
				"Be you, be proud of you because you can do what you want to do",
		});
	}

	clickThru() {
		this.simidProtocol.sendMessage(CreativeMessage.CLICK_THRU, {
			x: 0,
			y: 0,
			url: "https://adtester.dailymotion.com",
			playerHandles: true,
		});
	}
	mute() {
		this.simidProtocol
			.sendMessage(CreativeMessage.REQUEST_VOLUME, {
				volume: 0,
				muted: true,
			})
			.then(() => {
				console.log("Simid Creative REQUEST_VOLUME success");
			})
			.catch((err) => {
				console.log("Simid Creative REQUEST_VOLUME failed", err);
			});
	}
	unmute() {
		this.simidProtocol
			.sendMessage(CreativeMessage.REQUEST_VOLUME, {
				volume: 1,
				muted: false,
			})
			.then(() => {
				console.log("Simid Creative REQUEST_VOLUME success");
			})
			.catch((err) => {
				console.log("Simid Creative REQUEST_VOLUME failed", err);
			});
	}
	setWrongVolume() {
		this.simidProtocol
			.sendMessage(CreativeMessage.REQUEST_VOLUME, {
				volume: -1,
				muted: "yes",
			})
			.then(() => {
				console.log("Simid Creative REQUEST_VOLUME success");
			})
			.catch((err) => {
				console.log("Simid Creative REQUEST_VOLUME failed", err);
			});
	}
	error() {
		this.simidProtocol.sendMessage(CreativeMessage.FATAL_ERROR, {
			errorCode: CreativeErrorCode.TECHNICAL_ERROR,
			errorMessage: "This is a random on purpose error",
		});
	}
	reportTracking() {
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
			.catch((err) => {
				console.log("Simid Creative REQUEST_TRACKING failed", err);
			});
	}
	changeAdDuration() {
		this.simidProtocol
			.sendMessage(CreativeMessage.REQUEST_CHANGE_AD_DURATION, {
				duration: 60,
			})
			.then(() => {
				console.log(
					"Simid Creative REQUEST_CHANGE_AD_DURATION success"
				);
			})
			.catch((err) => {
				console.log(
					"Simid Creative REQUEST_CHANGE_AD_DURATION failed",
					err
				);
			});
	}
	requestFullscreen() {
		this.simidProtocol
			.sendMessage(CreativeMessage.REQUEST_FULL_SCREEN, {
				duration: 30,
			})
			.then(() => {
				console.log("Simid Creative REQUEST_FULL_SCREEN success");
			})
			.catch((err) => {
				console.log("Simid Creative REQUEST_FULL_SCREEN failed", err);
			});
	}
	requestExitFullscreen() {
		this.simidProtocol
			.sendMessage(CreativeMessage.REQUEST_EXIT_FULL_SCREEN)
			.then(() => {
				console.log("Simid Creative REQUEST_EXIT_FULL_SCREEN success");
			})
			.catch((err) => {
				console.log(
					"Simid Creative REQUEST_EXIT_FULL_SCREEN failed",
					err
				);
			});
	}
}
