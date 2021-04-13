import { component } from "/components/component.js";
import { image } from "/components/image.js";
import { label } from "/components/label.js";

export class tag extends component {
	constructor (_properties = {}) {
		super({ ..._properties, canfocus: true });

		const { text, icon, composition, secondary, embedded } = _properties;
		this.property({ name: "text", value: text, options: { default: null, isattribute: true } })
			.property({ name: "icon", value: icon, options: { default: null, isattribute: true } })

			.property({ name: "composition", value: composition, options: { default: null, isattribute: true } })
			.property({ name: "secondary", value: secondary, options: { default: null, isattribute: true } })
			.property({ name: "embedded", value: embedded, options: { default: null, isattribute: true } });
    }

	connectedCallback ({ style, markup } = {}) {
		super.conditionsCallback();
		super.connectedCallback({
			style: component.template`
				:host { user-select: none; touch-action: none; }
				:host { display: inline-grid; background: var(--action-p-1); color: var(--action-p-f); border: 2px solid transparent; padding: 8.5px; grid-gap: 6px; align-items: center; justify-content: center; align-content: center; letter-spacing: 1px; cursor: pointer; white-space: nowrap; outline: 0; box-shadow: var(--action-p-s); }
				:host([secondary="true"]) { background: var(--action-s-1); color: var(--action-s-f); box-shadow: var(--action-s-s); }
				:host([embedded="true"]) { background: var(--action-e-1); color: var(--action-e-f);  box-shadow: var(--action-e-s); }

				:host([composition="text icon"]) { grid-template-columns: auto min-content; }
				:host([composition="icon text"]) { grid-template-columns: min-content auto; }
				:host([composition="text"]),
				:host([composition="icon"]) { grid-template-columns: auto; }

				:host(:hover) { background: var(--action-p-2); }
				:host(:focus) { border-color: var(--action-p-3); }

				:host([secondary="true"]:hover) { background: var(--action-s-2); }
				:host([secondary="true"]:focus) { border-color: var(--action-s-2); }

				:host([embedded="true"]:hover) { background: var(--action-e-2); }
				:host([embedded="true"]:focus) { border-color: var(--action-e-3); }

				app-image { font-size: 10pt; }

				${style ? style() : ""}
			`,

			markup: component.template`
				${markup ? markup() : ""}
			`
		});

		// Initial render.
		this.render();

		// Redirect events.
		this.events.redirect(this, "click", "activated");
		this.events.redirect(this, "keydown");

		// Handle events.
		this.events.on("text updated", _value => this.render());
		this.events.on("icon updated", _value => this.render());

		this.events.on("keydown", _event => {
			_event.key === "Enter" && this.events.emit("activated");
			this.events.emit("changed");
		});
	}

	disconnectedCallback () {
		super.disconnectedCallback();
	}

	render () {
		const textElement = this.find("#text");
		if (textElement) textElement.remove();

		const iconElement = this.find("#icon");
		if (iconElement) iconElement.remove();

		const templateElement = document.createElement("template");
		this.composition.split(" ").forEach(_type => {
			const value = this[_type];

			switch (_type) {
				case "text": templateElement.innerHTML += `<app-label id="text">${value}</app-label>`; break;
				case "icon": templateElement.innerHTML += `<app-image id="icon" icon="${value}"></app-image>`; break;
			}
		});

		this.append(templateElement.content.cloneNode(true));
	}
}

globalThis.customElements.define("app-tag", tag);