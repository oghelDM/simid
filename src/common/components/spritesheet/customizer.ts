import { Spritesheet } from ".";
import { Customizer } from "../customizer";
import { SpritesheetType, defaultValuesSpritesheet } from "./defaultValues";

export class SpritesheetCustomizer extends Customizer {
	constructor(root: HTMLElement) {
		// remove the height property to not break the component aspect ratio
		super(
			{ ...defaultValuesSpritesheet },
			{ width: 50, left: 10, top: 10 }
		);

		const folder2 = this.gui.addFolder("spritesheet properties");
		folder2.open();
		folder2
			.add(this.props, "framerate", 1, 500)
			.step(1)
			.onChange((v: number) => this.onPropsUpdate("framerate", v));
		folder2
			.add(
				this.props,
				"startFrame",
				0,
				(this.props as SpritesheetType).nbFrames - 1
			)
			.step(1)
			.onChange((v: number) => this.onPropsUpdate("startFrame", v));
		["isPaused", "isBackwards", "isLoop"].forEach((property) =>
			folder2
				.add(this.props, property)
				.onChange((v: boolean) => this.onPropsUpdate(property, v))
		);

		const folder3 = this.gui.addFolder("spritesheet public methods");
		folder3.open();
		folder3.add(
			{ start: () => (this.component as Spritesheet).start() },
			"start"
		);
		folder3.add(
			{ stop: () => (this.component as Spritesheet).stop() },
			"stop"
		);
		folder3.add(
			{
				init: () =>
					(this.component as Spritesheet).init(
						this.props as any,
						this.getCssValues()
					),
			},
			"init"
		);

		this.component = new Spritesheet(
			this.props as SpritesheetType,
			this.getCssValues()
		);
		root.appendChild(this.component);
	}
}
