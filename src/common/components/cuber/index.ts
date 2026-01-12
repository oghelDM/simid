import { CssType } from "@/types";
import { IndexManager } from "../indexManager";
import { CuberType, defaultValuesCuber } from "./defaultValues";

export class Cuber extends IndexManager {
	protected cleanProps: Required<CuberType>;

	container: HTMLElement;
	cube: HTMLElement;
	faces: HTMLElement[];

	constructor(props: CuberType, window: Window, style: CssType = {}) {
		super();

		this.init(props, window, style);
	}

	public init(props: CuberType, window: Window, style: CssType) {
		this.cleanProps = { ...defaultValuesCuber, ...props };

		super.init(this.cleanProps, window, style);

		const {
			id,
			debug = false,
			productUrls,
			parent,
			perspective,
			faceLeft,
			faceRight,
			faceTop,
			faceBottom,
			perspectiveOrigin,
		} = this.cleanProps;

		this.setAttribute("id", id);
		const actualStyle = {
			display: "block",
			position: "absolute",
			width: "100%",
			height: "100%",
			top: 0,
			left: 0,
			backgroundColor: debug ? "#00ff0088" : "unset",
			overflow: "hidden",

			...style,
		};

		for (const [key, value] of Object.entries(actualStyle)) {
			(this.style as any)[key] = value;
		}

		// faces initialization
		const container = document.createElement("div");
		container.id = "id-container";
		container.style.position = "absolute";
		container.style.zIndex = "9";
		container.style.width = `${this.cleanProps.focusedElementWidth}%`;
		container.style.height = `${this.cleanProps.focusedElementHeight}%`;
		container.style.perspectiveOrigin = perspectiveOrigin as string;
		container.style.alignItems = "center";
		container.style.pointerEvents = "none";
		if (faceRight !== null) {
			container.style.right = `${faceRight}%`;
		} else {
			container.style.left = `${faceLeft}%`;
		}
		if (faceBottom !== null) {
			container.style.bottom = `${faceBottom}%`;
		} else {
			container.style.top = `${faceTop}%`;
		}
		this.container = container;
		this.appendChild(container);

		let distToCenter = this.getDistToCenter(parent);
		container.style.perspective = `${
			(perspective as number) * distToCenter
		}px`;
		console.log("distToCenter: ", distToCenter);

		const zout = document.createElement("div");
		zout.id = "id-zout";
		zout.style.position = "relative";
		zout.style.width = "100%";
		zout.style.height = "100%";
		zout.style.transform = `translateZ(${-distToCenter}px)`;
		zout.style.transformStyle = "preserve-3d";
		container.appendChild(zout);

		const cube = document.createElement("div");
		cube.id = "id-cube";
		cube.style.position = "relative";
		cube.style.width = "100%";
		cube.style.height = "100%";
		cube.style.transform = "preserve-3d";
		cube.style.display = "block";
		cube.style.transformStyle = "preserve-3d";
		this.cube = cube;
		zout.appendChild(cube);

		const { isVertical } = this.cleanProps;

		this.faces = productUrls.map((product, i) => {
			const face = document.createElement("div");
			face.id = `id-face-${i}`;
			face.style.position = "absolute";
			face.style.backgroundColor = "pink";
			face.style.width = "100%";
			face.style.height = "100%";
			face.style.border = "1px solid black";
			face.style.transform = `rotate${isVertical ? "X" : "Y"}(${
				(i * 360) / this.nbProducts
			}deg) translateZ(${distToCenter}px)`;

			face.style.backgroundImage = `url(${product})`;
			face.style.backgroundPosition = "center";
			face.style.backgroundRepeat = "no-repeat";
			face.style.backgroundSize = "cover";
			cube.appendChild(face);

			return face;
		});

		window.addEventListener("resize", () => {
			distToCenter = this.getDistToCenter(parent);
			container.style.perspective = `${
				(perspective as number) * distToCenter
			}px`;
			zout.style.transform = `translateZ(${-distToCenter}px)`;
			this.faces.forEach(
				(face, i) =>
					(face.style.transform = `rotate${isVertical ? "X" : "Y"}(${
						(i * 360) / this.nbProducts
					}deg) translateZ(${distToCenter}px)`)
			);
		});
	}

	protected update(): void {
		super.update();
		this.cube.style.transform = this.cleanProps.isVertical
			? `rotateX(${(this.currentIndex * 360) / this.nbProducts}deg)`
			: `rotateY(${(this.currentIndex * -360) / this.nbProducts}deg)`;
	}

	private getDistToCenter = (parent: HTMLElement) => {
		if (this.cleanProps.isVertical) {
			// height, in pixels, of the focused face
			const faceHeightPx =
				(parent.getBoundingClientRect().height *
					parseFloat(this.style.height) *
					this.cleanProps.focusedElementHeight) /
				100 /
				100;
			return faceHeightPx / (2 * Math.tan(Math.PI / this.nbProducts));
		}
		// width, in pixels, of the focused face
		const faceWidthPx =
			(parent.getBoundingClientRect().width *
				parseFloat(this.style.width) *
				this.cleanProps.focusedElementWidth) /
			100 /
			100;
		return faceWidthPx / (2 * Math.tan(Math.PI / this.nbProducts));
	};
}

// declare the new web component to allow constructor instanciation
customElements.define("dm-cuber", Cuber);
