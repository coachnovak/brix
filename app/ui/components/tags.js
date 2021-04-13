import { component } from "/components/component.js";
import { textbox } from "/components/textbox.js";
import { button } from "/components/button.js";
import { tag } from "/components/tag.js";

export class tags extends component {
	constructor (_properties = {}) {
		super({ ..._properties });

		const { fontsize, uppercase, secondary, embedded, composition, addable } = _properties;
		this.property({ name: "fontsize", value: fontsize, options: { default: null } })
			.property({ name: "uppercase", value: uppercase, options: { default: null, isattribute: true } })
			.property({ name: "composition", value: composition, options: { default: "text", isattribute: true } })
			.property({ name: "secondary", value: secondary, options: { default: null, isattribute: true } })
			.property({ name: "embedded", value: embedded, options: { default: null, isattribute: true } })
			.property({ name: "addable", value: addable, options: { default: null, isattribute: true } });
    }

	connectedCallback ({ style, markup } = {}) {
		super.conditionsCallback();
		super.connectedCallback({
			style: component.template`
				:host { display: flex; flex-direction: row; flex-wrap: wrap; gap: 3px; }

				:host([fontsize="s"]) { font-size: 7pt; --app-textbox-font-size: 7pt; --app-textbox-padding: 9px; }
				:host([fontsize="n"]) { font-size: 9pt; --app-textbox-font-size: 9pt; --app-textbox-padding: 9px; }
				:host([uppercase="true"]) { text-transform: uppercase; --app-textbox-text-transform: uppercase; }

				app-textbox { width: 130px; vertical-align: middle; }
				app-textbox { --app-textbox-border-radius: 0; }

				:host([fontsize="s"]) app-button { padding: 6px; border-radius: 0; min-width: 32px; }
				:host([fontsize="n"]) app-button { padding: 8px; border-radius: 0; min-width: 36px; }

				${style ? style() : ""}
			`,

			markup: component.template`
				<div id="add">
					<app-textbox placeholder="..." visible="false"></app-textbox>
					<app-button icon="plus" composition="icon" secondary="${this.secondary}" embedded="${this.embedded}" visible="true"></app-button>
				</div>

				${markup ? markup() : ""}
			`
		});

		// Redirect events.
		/* None. */

		// Handle events.
		super.find("app-button").events.on("activated", () => this.new());
		super.find("app-textbox").events.on("activated", () => this.save());
		super.find("app-textbox").events.on("cancelled", () => this.reset());
		super.find("app-textbox").events.on("blurred", () => this.reset());

		this.events.on("addable updated", _value => {
			super.find("app-button").visible = _value;
		});
	}

	disconnectedCallback () {
		super.disconnectedCallback();
	}

	add (_options) {
		const { id, text, icon } = _options;
		const tagElement = new tag({
			id,
			text,
			icon,
			composition: this.composition,
			secondary: this.secondary,
			embedded: this.embedded
		});

		const addElement = super.find("#add");
		addElement.parentNode.insertBefore(tagElement, addElement);

		this.find(id).events.on("activated", () => {
			this.events.emit("activated", id);
		});

		return this;
	}

	new () {
		const buttonElement = super.find("app-button");
		buttonElement.visible = false;

		const textboxElement = super.find("app-textbox");
		textboxElement.visible = true;
		textboxElement.focus();
	}

	save () {
		const textboxElement = super.find("app-textbox");
		this.events.emit("saved", textboxElement.value);
		this.reset();
	}

	reset () {
		const textboxElement = super.find("app-textbox");
		textboxElement.visible = false;
		textboxElement.value = "";

		const buttonElement = super.find("app-button");
		buttonElement.visible = true;
		buttonElement.focus();
	}

	find (_id) {
		return super.find(`#${_id}`);
	}
}

globalThis.customElements.define("app-tags", tags);