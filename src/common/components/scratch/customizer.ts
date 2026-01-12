import { Scratch } from ".";
import { Customizer } from "../customizer";
import { ScratchType, defaultValuesScratch } from "./defaultValues";

export class ScratchCustomizer extends Customizer {
	constructor(root: HTMLElement) {
		// remove the height property to not break the component aspect ratio
		super({ ...defaultValuesScratch }, { width: 100, left: 0, top: 0 });

		// needed to reposition and resize the images
		this.forceInitOnStyleUpdate = true;

		const folder2 = this.gui.addFolder("spritesheet properties");
		folder2.open();
		folder2
			.add(this.props, "timeoutDuration", 0, 5000)
			.step(1)
			.onChange((v: number) => {
				this.onPropsUpdate("timeoutDuration", v);
			});
		folder2
			.add(this.props, "scratchSizeCoeff", 0, 10)
			.step(0.01)
			.onChange((v: number) => {
				this.onPropsUpdate("scratchSizeCoeff", v);
			});
		folder2.add(this.props, "cursorAutoRotate").onChange((v: boolean) => {
			this.onPropsUpdate("cursorAutoRotate", v);
		});

		const folder3 = this.gui.addFolder("images");
		folder3.open();
		folder3.add(
			{ scratchImage: () => this.uploadFile("scratchImageUrl") },
			"scratchImage"
		);
		folder3.add(
			{ cursorImage: () => this.uploadFile("cursorUrl") },
			"cursorImage"
		);

		this.component = new Scratch(
			this.props as ScratchType,
			this.getCssValues()
		);
		root.appendChild(this.component);
	}

	uploadFile = (propertyName: string) => {
		const input = document.createElement("input");
		input.setAttribute("id", "image-file");
		input.setAttribute("type", "file");
		input.onchange = () => {
			if (input.files) {
				const imageUrl = window.webkitURL.createObjectURL(
					input.files[0]
				);
				this.onPropsUpdate(propertyName, imageUrl);
			}
		};
		input.click();
	};

	protected onStyleUpdate(property: string, value: any) {
		super.onStyleUpdate(property, value);
	}
}
