export const hotSpotBounce = (
	domElem: HTMLElement,
	duration: number,
	delay = 0
) =>
	domElem.animate([{ scale: 1 }, { scale: 1.1 }, { scale: 1 }], {
		delay,
		duration,
		fill: "forwards",
		easing: "ease-out",
		iterations: Infinity,
	});

export const bounceIn = (domElem: HTMLElement, duration: number, delay = 0) =>
	domElem.animate(
		[{ scale: 0 }, { scale: 1.05 }, { scale: 0.95 }, { scale: 1 }],
		{
			delay,
			duration,
			fill: "forwards",
			easing: "ease-out",
		}
	);

export const bounceOut = (domElem: HTMLElement, duration: number, delay = 0) =>
	domElem.animate([{ scale: 1 }, { scale: 1.1 }, { scale: 0 }], {
		delay,
		duration,
		fill: "forwards",
		easing: "ease-out",
	});

export const rotate = (domElem: HTMLElement, duration: number, delay = 0) =>
	domElem.animate(
		[{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
		{
			delay,
			duration,
			fill: "forwards",
			easing: "linear",
			iterations: Infinity,
		}
	);

export const bounceCta = (
	domElem: HTMLElement,
	animProps: {
		duration?: number;
		delay?: number;
		fill?: FillMode | undefined;
		iterations?: number;
	} = {}
) =>
	domElem.animate([{ scale: "1" }, { scale: "1.1" }, { scale: "1" }], {
		duration: 3000,
		delay: 0,
		fill: "forwards",
		iterations: Infinity,
		...animProps,
	});
