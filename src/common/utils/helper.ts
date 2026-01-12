export const trackPixel = (url: string) => {
	if (typeof window !== "undefined" && window !== null) {
		const i = new Image();
		i.src = url;
	}
};

// check if device is mobile
export const isMobile = (): boolean => {
	const nav =
		navigator.userAgent || navigator.vendor || (window as any).opera;
	return (
		/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
			nav
		) ||
		/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
			nav.substr(0, 4)
		)
	);
};

export const isMac = (): boolean => {
	const userAgent = window.navigator.userAgent.toLowerCase();

	// look for mac, Mac, iPhone, iPad, ...
	return userAgent.includes("mac") || userAgent.includes("ip");
};

// update a DOM element display depending on device and orientation
export const updateDisplay = (domElement: HTMLElement): void => {
	const isPortrait = window.matchMedia("(orientation: portrait)").matches;
	const isMobileDevice = isMobile();

	domElement.style.height = isMobileDevice && !isPortrait ? "100%" : "auto";
	domElement.style.width = isMobileDevice && !isPortrait ? "auto" : "100%";
};

export const map = (
	value: number,
	start1: number,
	stop1: number,
	start2: number,
	stop2: number
): number => start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));

export const keepSafe = (idx: number, nb: number): number =>
	((idx % nb) + nb) % nb;

export const clamp = (value: number, min: number, max: number): number =>
	Math.min(Math.max(value, min), max);

export const random12 = (v1: number, v2: number): number =>
	map(Math.random(), 0, 1, v1, v2);

export const getClientXY = (
	evt: PointerEvent | MouseEvent,
	rect = { left: 0, top: 0 }
) => {
	const x = evt.clientX - rect.left;
	const y = evt.clientY - rect.top;
	return { x, y };
};

/**
 * The selectedMedia for the videoSlot
 * @type {Object}
 * @private
 */
export const pickVideo = (objectMedias: any, videoSlot: HTMLVideoElement) => {
	const mediasList = Object.values(objectMedias);
	//   const videoSlotWidth = parseFloat(videoSlot.style.width);
	const videoSlotWidth = window.innerWidth;
	let selectedMedia: any = null;

	for (const media of mediasList) {
		// If cannot playType, then skip it
		if (!videoSlot.canPlayType((media as any).mimeType)) {
			// eslint-disable-next-line no-continue
			continue;
		}

		// Select at least one media (if possible aka canPlayType)
		if (selectedMedia === null) {
			selectedMedia = media;
		}

		// Select the closest upper videoSize from the videoSlot
		if ((media as any).width >= videoSlotWidth) {
			if (
				(media as any).width <= selectedMedia.width ||
				selectedMedia.width <= videoSlotWidth
			) {
				selectedMedia = media;
			}
		}
	}

	// console.log("selectedMedia :", selectedMedia);

	return selectedMedia;
};

// returns the offsets and dimensions of an image that is to fit inside a parent, whether in 'cover' or 'contain' mode
const fit =
	(contains: boolean) =>
	(
		parentWidth: number,
		parentHeight: number,
		childWidth: number,
		childHeight: number,
		scale = 1,
		offsetX = 0.5,
		offsetY = 0.5
	) => {
		const childRatio: number = childWidth / childHeight;
		const parentRatio: number = parentWidth / parentHeight;
		let width: number = parentWidth * scale;
		let height: number = parentHeight * scale;

		if (contains ? childRatio > parentRatio : childRatio < parentRatio) {
			height = width / childRatio;
		} else {
			width = height * childRatio;
		}

		return {
			width,
			height,
			offsetX: (parentWidth - width) * offsetX,
			offsetY: (parentHeight - height) * offsetY,
		};
	};

export const shuffle = (array: any[]) => {
	let currentIndex = array.length;

	// While there remain elements to shuffle...
	while (currentIndex != 0) {
		// Pick a remaining element...
		let randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [
			array[randomIndex],
			array[currentIndex],
		];
	}
};

export const contain = fit(true);
export const cover = fit(false);

export function easeInCubic(x: number): number {
	return x * x * x;
}

export function easeOutCubic(x: number): number {
	return 1 - Math.pow(1 - x, 3);
}

export function easeInOutCubic(x: number): number {
	return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
