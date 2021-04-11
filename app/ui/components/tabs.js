import { component } from "/components/component.js";
import { button } from "/components/button.js";

export class tabs extends component {
	constructor (_properties = {}) {
		super({ ..._properties });

		const { selected } = _properties;
		this.property({ name: "selected", value: selected, options: { default: null } });
    }

	connectedCallback ({ style, markup } = {}) {
		super.conditionsCallback();
		super.connectedCallback({
			style: component.template`
				#buttons > app-button { display: inline-grid; margin-right: 10px; padding: 12px; }
				#buttons > app-button:last-child { margin-right: 0; }
				#buttons > app-button.selected { border-bottom-color: var(--paper-3); }

				${style ? style() : ""}
			`,

			markup: component.template`
				<div id="buttons"></div>

				${markup ? markup() : ""}
			`
		});
	}

	disconnectedCallback () {
		super.disconnectedCallback();
	}

	add (_id, _button) {
		const buttonsElement = this.find("#buttons");
		const buttonElement = buttonsElement.appendChild(new button({
			id: `tab_${_id}`,
			size: "large",
			embedded: true,
			..._button
		}));

		buttonElement.events.on("activated", () => this.activate(_id));
		if (this.selected === null) this.activate(_id);
	}

	activate (_id) {
		const oldButtonElement = this.find(`#tab_${this.selected}`);
		if (oldButtonElement) oldButtonElement.classList.remove("selected");

		const newButtonElement = this.find(`#tab_${_id}`);
		newButtonElement.classList.add("selected");

		this.selected = _id;
		this.events.emit("selected");
	}
}

globalThis.customElements.define("app-tabs", tabs);