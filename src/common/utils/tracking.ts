import { getClientXY } from "./helper";

const DEBOUCE = 300; // in milliseconds, time after which the tracking is not awaited anymore

export enum INTERACTION_TARGET {
	videoControlsPlayBtn = "videoControlsPlayBtn",
	videoControlsPauseBtn = "videoControlsPauseBtn",
	videoControlsFullScreenBtn = "videoControlsFullScreenBtn",
	videoControlsMuteBtn = "videoControlsMuteBtn",
}

export enum INTERACTION_TYPE {
	click = "click",
	clickThrough = "click-through",
	touch = "touch",
	over = "over",
	swipe = "swipe",
	swipeLeft = "swipe-left",
	swipeRight = "swipe-right",
	swipeTop = "swipe-top",
	swipeBottom = "swipe-bottom",
	close = "close",
	auto = "auto",
}

export enum ELEMENT_NAME {
	playBtn = "play-btn",
	yesBtn = "yes-btn",
	noBtn = "no-btn",
}

enum INTERACTION_TYPE_LIMITED {
	click = "click",
	touch = "touch",
	over = "over",
	auto = "auto",
	swipe = "swipe",
	close = "close",
	unknown = "unknown",
}

const DEFAULT_AD_PARAMS =
	'{ "creativeId": "creativeIdUnknown", "creativeVersion":"" }';

export abstract class Tracking {
	private static uuid: string;
	private static eventIndex: number;
	private static creativeId: string;
	private static creativeVersion: string;
	private static parameters: any;
	private static masterUuid = ""; // this is actually used as the creative formatName

	public static init(adParameters = DEFAULT_AD_PARAMS): void {
		this.uuid = crypto.randomUUID();
		this.eventIndex = 0;

		const parsedParams = JSON.parse(adParameters || DEFAULT_AD_PARAMS);
		this.creativeId = parsedParams.creativeId;
		this.creativeVersion = parsedParams.creativeVersion;

		[
			"360",
			"AdSelector",
			"Advergame",
			"Cards",
			"Carousel",
			"Countdown",
			"Cuber",
			"Earth",
			"FastImpact",
			"Hotspot",
			"LiveStream",
			"Mask",
			"MultiVideo",
			"Selector",
			"Shaper",
			"Split",
			"StoreLocator",
			"Vertical",
			"ViewShop",
			"TakeOver",
			"Custom",
			//
			"POC",
		]
			.sort((a, b) => a.length - b.length)
			.forEach((formatName) => {
				if (
					this.creativeId
						.toLocaleLowerCase()
						.includes(formatName.toLocaleLowerCase())
				) {
					this.masterUuid = formatName;
				}
			});

		// retrieve macros from script url
		// ALTERNATIVE METHOD: retrieve macros from VAST AdParameters (creativeData["AdParameters"] in App.ts)
		try {
			const getScriptURL = (() => {
				const scripts = document.getElementsByTagName("script");
				const index = scripts.length - 1;
				const myScript = scripts[index];
				return () => myScript.src;
			})();
			const scriptUrl = getScriptURL();
			if (scriptUrl) {
				const urlObj = new URL(scriptUrl);
				const urlParams = new URLSearchParams(urlObj.search);
				this.parameters = {};
				[
					"inventory_id",
					"external_creative_id",
					"external_campaign_id",
					"external_insertion_order_id",
				].forEach((macroName) => {
					const macroValue = urlParams.get(macroName);
					// if the macro is not present or has not been replaced with a proper value, send null
					this.parameters[macroName] =
						macroValue && !macroValue.startsWith("${")
							? macroValue
							: null;
				});
			}
			this.actuallySendTracker(
				"creative",
				INTERACTION_TYPE_LIMITED.auto,
				"start"
			);
		} catch (error) {
			console.log("error while parsing macros: ", error);
		}
	}

	public static sendTracker = async (
		elementName: string | ELEMENT_NAME,
		interactionType: INTERACTION_TYPE,
		event: PointerEvent | MouseEvent,
		interactionMsg = ""
	) => {
		// add this to a new payload field
		if (event.target && event.target instanceof Element) {
			let { x, y } = getClientXY(event);
			const { innerWidth, innerHeight } = window;
			x = Math.round((x / innerWidth) * 10000) / 100;
			y = Math.round((y / innerHeight) * 10000) / 100;
		}

		let interaction_type: INTERACTION_TYPE_LIMITED;
		switch (interactionType) {
			case INTERACTION_TYPE.auto:
				interaction_type = INTERACTION_TYPE_LIMITED.auto;
				break;
			case INTERACTION_TYPE.close:
			case INTERACTION_TYPE.over:
			case INTERACTION_TYPE.touch:
				interaction_type =
					interactionType as unknown as INTERACTION_TYPE_LIMITED;
				break;
			case INTERACTION_TYPE.click:
			case INTERACTION_TYPE.clickThrough:
				interaction_type = INTERACTION_TYPE_LIMITED.click;
				break;
			case INTERACTION_TYPE.swipe:
			case INTERACTION_TYPE.swipeBottom:
			case INTERACTION_TYPE.swipeLeft:
			case INTERACTION_TYPE.swipeRight:
			case INTERACTION_TYPE.swipeTop:
				interaction_type = INTERACTION_TYPE_LIMITED.swipe;
				break;
			default:
				interaction_type = INTERACTION_TYPE_LIMITED.unknown;
				break;
		}

		let interaction_msg = interactionMsg;
		switch (interactionType) {
			case INTERACTION_TYPE.clickThrough:
				interaction_msg = `click-through${
					interactionMsg ? " - " : ""
				}${interactionMsg}`;
				break;
			case INTERACTION_TYPE.swipeBottom:
				interaction_msg = `bottom${
					interactionMsg ? " - " : ""
				}${interactionMsg}`;
				break;
			case INTERACTION_TYPE.swipeLeft:
				interaction_msg = `left${
					interactionMsg ? " - " : ""
				}${interactionMsg}`;
				break;
			case INTERACTION_TYPE.swipeRight:
				interaction_msg = `right${
					interactionMsg ? " - " : ""
				}${interactionMsg}`;
				break;
			case INTERACTION_TYPE.swipeTop:
				interaction_msg = `top${
					interactionMsg ? " - " : ""
				}${interactionMsg}`;
				break;
			default:
				break;
		}

		await Promise.race([
			this.actuallySendTracker(
				elementName,
				interaction_type,
				interaction_msg
			),
			new Promise((resolve) =>
				setTimeout(() => resolve(undefined), DEBOUCE)
			),
		]);
	};

	private static getAncestorOrigins = (): string[] => {
		if (location.ancestorOrigins !== undefined) {
			return [...location.ancestorOrigins];
		}
		const urls = [];
		let parentWin = window;
		while (parentWin !== window.top) {
			if (parentWin.document.referrer) {
				try {
					const url = new URL(parentWin.document.referrer);
					urls.push(url.origin);
				} catch (e) {
					// console.error
				}
			}
			// @ts-ignore
			parentWin = parentWin.parent;
		}
		return urls;
	};

	private static actuallySendTracker = async (
		elementName: string,
		interactionType: INTERACTION_TYPE_LIMITED,
		interactionMessage: string
	) => {
		const topDomain = this.getAncestorOrigins().pop();

		const payload = {
			edward: "1.1",
			sent_ts: Date.now(),
			events: [
				{
					name: "creative_action",
					version: "1.0",
					data: {
						created_ts: Date.now(),
						event_index: this.eventIndex,
						version_id: this.creativeVersion,
						creative_id: this.creativeId,
						top_domain: topDomain,
						element_name: elementName,
						interaction_type: interactionType,
						interaction_message: interactionMessage,
						uuid: this.uuid,
						master_uuid: this.masterUuid,
						...this.parameters,
					},
				},
			],
			stack_ctx: {},
		};
		console.log("sendTracker payload: ", payload);
		this.eventIndex += 1;

		// Define the tracking endpoint URL
		const stage = "https://cebed.stg.dm.gg";
		const prod = "https://cebed.dailymotionbus.com";
		const trackingEndpoint =
			!topDomain || // local dev
			topDomain.includes("adtester.dailymotion.com") || // Dailymotion AdTester
			topDomain.includes("https://googleads.github.io") || // Google Ads IMA AdTester
			topDomain.includes("statics.dmcdn.net") || // Dailymotion Demo website
			topDomain.includes("localhost:") // local dev
				? stage
				: prod;
		try {
			const response = await fetch(trackingEndpoint, {
				method: "POST",
				headers: {
					Origin: "https://geo.dailymotion.com",
				},
				body: JSON.stringify(payload),
			});

			if (response.ok) {
				// Request was successful, tracker executed
				// console.log("Tracker executed successfully.");
			} else {
				// Request failed, handle error here
				console.error("Tracker failed with status: " + response.status);
			}
		} catch (error) {
			// Handle network or other errors
			console.error("An error occurred while tracking:", error);
		}
	};
}
