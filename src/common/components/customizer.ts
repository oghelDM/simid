import * as dat from "dat.gui";

import { Cuber } from "./cuber";
import { Scratch } from "./scratch";
import { Spritesheet } from "./spritesheet";
import { CarouselBasic } from "./carouselBasic";
import { CuberType } from "./cuber/defaultValues";
import { ScratchType } from "./scratch/defaultValues";
import { SpritesheetType } from "./spritesheet/defaultValues";
import { CarouselBasicType } from "./carouselBasic/defaultValues";

type Component = CarouselBasic | Cuber | Spritesheet | Scratch;
type PropsType = CarouselBasicType | CuberType | SpritesheetType | ScratchType;

export class Customizer {
	protected gui: any;
	protected component: Component;
	protected props: PropsType;
	protected styleProps: any;
	protected forceInitOnStyleUpdate: boolean = false;

	constructor(props: PropsType, styleProps?: any) {
		this.props = { ...props };
		this.styleProps = styleProps || {
			width: 80,
			height: 80,
			left: 10,
			top: 10,
		};

		this.gui = new dat.GUI();
		this.gui.domElement.id = "gui";
		const sheet = document.createElement("style");
		sheet.innerHTML = `#gui {width: 400px !important} #player-wrapper {width: calc(90% - 400px);  margin-left: 5%}`;
		document.body.appendChild(sheet);

		// use localStorage to store values
		// this.gui.remember(this.styleProps);
		// this.gui.remember(this.props);

		const folder1 = this.gui.addFolder("component css style");
		folder1.open();

		Object.keys(this.styleProps).forEach((property) =>
			folder1
				.add(this.styleProps, property, 0, 100)
				.onChange((v: any) => this.onStyleUpdate(property, v))
		);
	}

	protected onPropsUpdate = (property: string, value: any) => {
		(this.props as any)[property] = value;
		this.component.init(this.props as any, window, this.getCssValues()); //TODO: type
	};

	protected onStyleUpdate(property: string, value: any) {
		this.styleProps[property] = value;
		if (this.forceInitOnStyleUpdate) {
			this.component.init(this.props as any, window, this.getCssValues()); //TODO: type
		} else {
			for (const [key, value] of Object.entries(this.getCssValues())) {
				(this.component.style as any)[key] = value;
			}
		}
	}

	protected getCssValues = () => {
		const actualStyleProps = {};
		for (const [key, value] of Object.entries(this.styleProps)) {
			(actualStyleProps as any)[key] = `${value}%`;
		}
		return actualStyleProps;
	};
}
