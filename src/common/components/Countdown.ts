import { createDiv } from "../utils/divMaker";
import { CssType, ComponentBaseType, HORIZONTAL_ALIGN } from "../types";

interface CountdownType extends ComponentBaseType {
	date: Date; // date in the format: 'Oct 21, 2023 09:00:00'
	isOverMessage?: string; // message to be displayed when the countdown is over. default is 00 00 00 00
	fontUrl?: string; // font url (.ttf) to use to display the countdown
	textAlign?: HORIZONTAL_ALIGN; // horizontal alignment of each text
	elementWidth: string; // the width of each textField element, use the same unit as the fontSize
	suffixes?: string[]; // an optional suffix for each time element: seconds, minutes, hours and days
}

export class Countdown extends HTMLElement {
	private intervalId: number;
	private last = 0; // timestamp of the last checkUpdate() call
	private dateMilliseconds; // date in milliseconds
	private isOverMessage;
	public dayDiv: HTMLElement;
	public hourDiv: HTMLElement;
	public minDiv: HTMLElement;
	public secDiv: HTMLElement;
	private suffixes: string[];

	public isOver = false;

	constructor(
		props: CountdownType,
		style: CssType = {},
		parentWindow: Window
	) {
		super();

		const {
			id,
			date,
			isOverMessage = "",
			fontUrl,
			debug,
			onClick,
			clickUrl,
			textAlign = HORIZONTAL_ALIGN.CENTER,
			elementWidth,
			suffixes = ["", "", "", ""],
		} = props;

		this.setAttribute("id", id);

		this.isOverMessage = isOverMessage;
		this.suffixes = suffixes;
		this.dateMilliseconds = date.getTime();

		let justifyContent = "space-between";
		if (textAlign === HORIZONTAL_ALIGN.LEFT) {
			justifyContent = "flex-start";
		} else if (textAlign === HORIZONTAL_ALIGN.RIGHT) {
			justifyContent = "flex-end";
		}
		const actualStyle: CssType = {
			position: "absolute",
			height: "3.5vi",
			lineHeight: "3.5vi",
			fontSize: "3.5vi",
			width: "100%",
			display: "flex",
			justifyContent,
			backgroundColor: debug ? "#00ffff88" : "unset",

			...style,
		};
		for (const [key, value] of Object.entries(actualStyle)) {
			(this.style as any)[key] = value;
		}

		[this.dayDiv, this.hourDiv, this.minDiv, this.secDiv] = new Array(4)
			.fill(0)
			.map((_, i) => {
				const div = createDiv(`countdown-${i}`, {
					backgroundColor: debug ? "#ffffff88" : "unset",
					width: elementWidth,
					height: "inherit",
					lineHeight: "inherit",
					fontSize: "inherit",
					textAlign: textAlign,
					cursor: "default",
					pointerEvents: "none",
					userSelect: "none",
					fontFamily: "inherit",
					color: "inherit",
					whiteSpace: "pre",
				});
				this.appendChild(div);
				return div;
			});

		if (fontUrl) {
			const customFont = new parentWindow.FontFace(
				"customFont",
				`url("${fontUrl}")`
			);
			customFont.load().then(() => {
				(parentWindow.document.fonts as any).add(customFont); // TODO: we shouldn't have to cast this as any...
				parentWindow.document.body.classList.add("fonts-loaded");
				this.style.fontFamily = customFont.family;
			});
		}

		this.addEventListener("click", () => onClick(clickUrl));

		this.checkUpdate();

		this.intervalId = parentWindow.window.setInterval(
			() => this.checkUpdate(),
			200
		);
	}

	checkUpdate = () => {
		const now = Date.now();
		if (!this.last || now - this.last >= 1000) {
			this.last = now;
			this.updateCountdown();
		}
	};

	updateCountdown = () => {
		const delta = this.dateMilliseconds - this.last;

		if (delta <= 0) {
			window.clearInterval(this.intervalId);
			this.innerHTML = this.isOverMessage;
			this.isOver = true;
			return;
		}

		const second = 1000; // number of milliseconds in a second
		const minute = second * 60; // number of milliseconds in a minute
		const hour = minute * 60; // number of milliseconds in an hour
		const day = hour * 24; // number of milliseconds in a day

		const options = { minimumIntegerDigits: 2 };
		const locales = undefined;

		const textDay = Math.floor(delta / day).toLocaleString(
			locales,
			options
		);
		const textHour = Math.floor((delta % day) / hour).toLocaleString(
			locales,
			options
		);
		const textMinute = Math.floor((delta % hour) / minute).toLocaleString(
			locales,
			options
		);
		const textSecond = Math.floor((delta % minute) / second).toLocaleString(
			locales,
			options
		);

		this.dayDiv.innerHTML = `${textDay}${this.suffixes[3] ?? ""}`;
		this.hourDiv.innerHTML = `${textHour}${this.suffixes[2] ?? ""}`;
		this.minDiv.innerHTML = `${textMinute}${this.suffixes[1] ?? ""}`;
		this.secDiv.innerHTML = `${textSecond}${this.suffixes[0] ?? ""}`;
	};
}

// declare the new web component to allow constructor instanciation
customElements.define("dm-countdown", Countdown);
