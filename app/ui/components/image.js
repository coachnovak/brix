import { component } from "/components/component.js";

export class image extends component {
	constructor (_properties = {}) {
		super({ ..._properties });

		const { generic, icon, fluent, width, height, size, sizing, position, repeat, styling, shape } = _properties;
		this.property({ name: "generic", value: generic, options: { default: null, isattribute: true } })
			.property({ name: "icon", value: icon, options: { default: null, isattribute: true } })
			.property({ name: "fluent", value: fluent, options: { default: null, isattribute: true } })

			.property({ name: "width", value: width, options: { default: null, isattribute: true } })
			.property({ name: "height", value: height, options: { default: null, isattribute: true } })
			.property({ name: "size", value: size, options: { default: null, isattribute: true } })
			.property({ name: "sizing", value: sizing, options: { default: null, isattribute: true } })
			.property({ name: "position", value: position, options: { default: null, isattribute: true } })
			.property({ name: "repeat", value: repeat, options: { default: null, isattribute: true } })
			.property({ name: "styling", value: styling, options: { default: null, isattribute: true } })
			.property({ name: "shape", value: shape, options: { default: false, isattribute: true } });
    }

	connectedCallback ({ style, markup } = {}) {
		super.connectedCallback({
			style: component.template`
				:host { display: block; }
				:host([shape="circle"]) { border-radius: 50%; }
				:host([float="left"]) { float: left; margin-right: 10px; margin-bottom: 10px; }
				:host([float="right"]) { float: right; margin-left: 10px; margin-bottom: 10px; }

				${style ? style() : ""}
			`,

			markup: component.template`
				${markup ? markup() : ""}
			`
		});

		// Initial render.
		this.render();

		// Redirect events.
		/* None. */

		// Handle events.
		this.events.on("generic updated", _value => this.render());
		this.events.on("icon updated", _value => this.render());
		this.events.on("fluent updated", _value => this.render());
	}

	disconnectedCallback () {
		super.disconnectedCallback();
	}

	render () {
		// Clean up styles.
		this.style.width = null;
		this.style.height = null;
		this.style.backgroundImage = null;
		this.style.backgroundSize = null;
		this.style.backgroundRepeat = null;
		this.style.backgroundPosition = null;

		// Clean up events.
		this.events.off([
			"width updated",
			"height updated",
			"size updated",
			"sizing updated",
			"repeat updated",
			"position updated"
		]);

		if (this.generic) {
			const oldGenericElement = this.find("#generic");
			const newGenericElement = document.createElement("img");
			newGenericElement.setAttribute("id", "generic");
			newGenericElement.setAttribute("src", this.generic);
			newGenericElement.setAttribute("loading", "lazy");
			newGenericElement.style.width = this.width;
			newGenericElement.style.height = this.height;

			if (oldGenericElement) oldGenericElement.replaceWith(newGenericElement);
			else newGenericElement = this.append(newGenericElement);

			this.events.on("width updated", _event => newGenericElement.style.width = this.width);
			this.events.on("height updated", _event => newGenericElement.style.height = this.height);
		} else if (this.icon) {
			const iconTemplateElement = document.createElement("template");
			iconTemplateElement.innerHTML = `<i id="icon" class="fad fa-${this.icon}"></i>`;
			this.append(iconTemplateElement.content.cloneNode(true));

			const iconElement = this.find("#icon");
			iconElement.style.fontSize = this.size;

			this.events.on("size updated", _event => iconElement.style.fontSize = this.size);
		} else if (this.fluent) {
			this.style.backgroundImage = `url('${this.fluent}')`;
			this.style.backgroundSize = this.sizing || "cover";
			this.style.backgroundRepeat = this.repeat || "no-repeat";
			this.style.backgroundPosition = this.position || "center center";

			this.style.width = this.width;
			this.style.height = this.height;

			this.events.on("width updated", _event => this.style.width = this.width);
			this.events.on("height updated", _event => this.style.height = this.height);
			this.events.on("sizing updated", _event => this.style.backgroundSize = this.sizing);
			this.events.on("repeat updated", _event => this.style.backgroundRepeat = this.repeat);
			this.events.on("position updated", _event => this.style.backgroundPosition = this.position);
		}
	}
}

globalThis.customElements.define("app-image", image);