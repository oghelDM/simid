import { CarouselBasic } from ".";
import { HORIZONTAL_ALIGN, VERTICAL_ALIGN } from "../../types";
import { CarouselBasicType, defaultValuesCarouselBasic } from "./defaultValues";
import { Customizer } from "../customizer";

export class CarouselBasicCustomizer extends Customizer {
	constructor(root: HTMLElement) {
		super(defaultValuesCarouselBasic);

		const folder2 = this.gui.addFolder("carousel properties");
		folder2.open();
		folder2
			.add(this.props, "verticalAlign", {
				top: VERTICAL_ALIGN.TOP,
				center: VERTICAL_ALIGN.CENTER,
				bottom: VERTICAL_ALIGN.BOTTOM,
			})
			.onChange((v: string) => this.onPropsUpdate("verticalAlign", v));
		folder2
			.add(this.props, "horizontalAlign", {
				left: HORIZONTAL_ALIGN.LEFT,
				center: HORIZONTAL_ALIGN.CENTER,
				right: HORIZONTAL_ALIGN.RIGHT,
			})
			.onChange((v: string) => this.onPropsUpdate("verticalAlign", v));
		[
			"focusedElementWidth",
			"unfocusedElementWidth",
			"focusedElementHeight",
			"unfocusedElementHeight",
			"gap",
		].forEach((property) =>
			folder2
				.add(this.props, property, 0, 100)
				.onChange((v: number) => this.onPropsUpdate(property, v))
		);
		["focusedElementOpacity", "unfocusedElementOpacity"].forEach(
			(property) =>
				folder2
					.add(this.props, property, 0, 1)
					.onChange((v: number) => this.onPropsUpdate(property, v))
		);
		["debug", "isVertical", "isInteractive", "autoPlay"].forEach(
			(property) =>
				folder2
					.add(this.props, property)
					.onChange((v: string) => this.onPropsUpdate(property, v))
		);
		folder2
			.add(this.props, "speedCoefficient", 0.1, 10)
			.onChange((v: number) => this.onPropsUpdate("speedCoefficient", v));

		this.component = new CarouselBasic(
			this.props as CarouselBasicType,
			window,
			this.getCssValues()
		);
		root.appendChild(this.component);
	}
}
