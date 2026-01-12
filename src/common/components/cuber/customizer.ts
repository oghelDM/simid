import { Cuber } from ".";
import { Customizer } from "../customizer";
import { CuberType, defaultValuesCuber } from "./defaultValues";

export class CuberCustomizer extends Customizer {
	private otherProps: any = {
		perspectiveX: 50,
		perspectiveY: 50,
		nbFaces: defaultValuesCuber.productUrls.length,
	};

	constructor(root: HTMLElement) {
		super(defaultValuesCuber);

		// needed to recalculate the distToCenter value
		this.forceInitOnStyleUpdate = true;

		(this.props as CuberType).parent = root;

		const folder2 = this.gui.addFolder("cuber properties");
		folder2.open();
		folder2
			.add(this.otherProps, "nbFaces", 3, 12)
			.step(1)
			.onChange((nbFaces: number) => {
				const products = [];
				for (let i = 0; i < nbFaces; i++) {
					products.push(
						defaultValuesCuber.productUrls[
							i % defaultValuesCuber.productUrls.length
						]
					);
				}
				this.onPropsUpdate("products", products);
			});
		[
			"focusedElementWidth",
			"focusedElementHeight",
			"faceLeft",
			"faceTop",
		].forEach((property) =>
			folder2
				.add(this.props, property, 0, 100)
				.onChange((v: number) => this.onPropsUpdate(property, v))
		);
		["debug", "isVertical", "isInteractive", "autoPlay"].forEach(
			(property) =>
				folder2
					.add(this.props, property)
					.onChange((v: boolean) => this.onPropsUpdate(property, v))
		);
		folder2
			.add(this.props, "perspective", 0.1, 10)
			.onChange((v: number) => this.onPropsUpdate("perspective", v));
		folder2
			.add(this.otherProps, "perspectiveX", -200, 200)
			.onChange(() => this.onPerspectiveOriginUpdate());
		folder2
			.add(this.otherProps, "perspectiveY", -200, 200)
			.onChange(() => this.onPerspectiveOriginUpdate());

		const folder3 = this.gui.addFolder("cuber methods");
		folder3.open();
		folder3.add(
			{ next: () => (this.component as Cuber).moveIndexBy(1) },
			"next"
		);
		folder3.add(
			{ previous: () => (this.component as Cuber).moveIndexBy(-1) },
			"previous"
		);

		this.component = new Cuber(
			this.props as CuberType,
			window,
			this.getCssValues()
		);
		root.appendChild(this.component);
	}

	private onPerspectiveOriginUpdate = () => {
		(
			this.props as CuberType
		).perspectiveOrigin = `${this.otherProps.perspectiveX}% ${this.otherProps.perspectiveY}%`;
		this.component.init(this.props as any, window, this.getCssValues());
	};
}
