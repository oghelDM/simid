import gsap from "gsap";

interface DefonceType {
	targetElement: HTMLElement;
	maskUrl: string;
	debug?: boolean;
}

export class Defonce {
	targetElement: HTMLElement;
	maskSize: number = 0;
	maskUrl: string;

	constructor(props: DefonceType) {
		const { targetElement, debug = false, maskUrl } = props;

		targetElement.style.backgroundColor = debug ? "#ff00ff88" : "unset";
		targetElement.style.maskImage = `url(${maskUrl})`;
		targetElement.style.webkitMaskImage = `url(${maskUrl})`;
		targetElement.style.maskSize = `${this.maskSize}%`;
		targetElement.style.webkitMaskSize = `${this.maskSize}%`;
		targetElement.style.maskRepeat = "no-repeat";
		targetElement.style.webkitMaskRepeat = "no-repeat";
		targetElement.style.maskPosition = "center";
		targetElement.style.webkitMaskPosition = "center";
		targetElement.style.webkitMaskComposite = "add";
		targetElement.style.maskComposite = "add";

		this.targetElement = targetElement;
		this.maskUrl = maskUrl;
		this.scaleTo(200);
	}

	scaleTo = (to: number) => {
		gsap.timeline().to(this, {
			maskSize: to,
			duration: 3,
			delay: 3,
			// ease: this.easing,
			onUpdate: () => {
				this.targetElement.style.maskSize = `${this.maskSize}%`;
				this.targetElement.style.webkitMaskSize = `${this.maskSize}%`;
				const q = `rgba(0,0,0,${(this.maskSize - 100) / 100})`;
				// allows a smooth fade-in of the whole div
				if (this.maskSize > 100) {
					this.targetElement.style.maskImage = `url(${this.maskUrl}), linear-gradient(${q} 0%, ${q} 100%)`;
					this.targetElement.style.webkitMaskImage = `url(${this.maskUrl}), linear-gradient(${q} 0%, ${q} 100%)`;
				}
			},
		});
	};
}
