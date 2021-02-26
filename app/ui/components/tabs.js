import { base } from "/components/base.js";
import { button } from "/components/button.js";

export class tabs extends base {
	constructor (_properties = {}) {
		super(Object.assign(_properties ? _properties : {}, {

        }));

		this
			.property("selected", _properties.selected ? _properties.selected : null);

		this.styles.push(`
			#buttons { text-align: center; }
			#buttons > app-button { display: inline-grid; margin-right: 10px; }
			#buttons > app-button:last-child { margin-right: 0; }
			#buttons > app-button.selected { border-bottom-color: var(--paper-4); }
		`);
	}

	async connectedCallback () {
		await super.connectedCallback();
		this.readInIcons();

		const buttonsElement = this.appendChild(document.createElement("div"));
		buttonsElement.setAttribute("id", "buttons");

		this.emit("ready");
	}

	add (_id, _button) {
		const buttonsElement = this.use("buttons");
		const buttonElement = buttonsElement.appendChild(new button(Object.assign(_button, {
			id: `tab_${_id}`,
			size: "large",
			embedded: true
		})));

		buttonElement.on("activated", () => this.activate(_id));
		if (this.selected === null) this.activate(_id);
	}

	activate (_id) {
		const oldButtonElement = this.use(`tab_${this.selected}`);
		if (oldButtonElement) oldButtonElement.classList.remove("selected");

		const newButtonElement = this.use(`tab_${_id}`);
		newButtonElement.classList.add("selected");

		this.selected = _id;
		this.emit("selected");
	}
}

globalThis.customElements.define("app-tabs", tabs);