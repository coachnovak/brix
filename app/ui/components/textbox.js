import { component } from "/components/component.js";

export class textbox extends component {
	constructor (_properties = {}) {
		super(_properties);

		const { type, placeholder, autocomplete, readonly, value } = _properties;
		this.property({ name: "type", value: type, options: { default: "text", isattribute: true } })
			.property({ name: "placeholder", value: placeholder, options: { default: "", isattribute: true } })
			.property({ name: "autocomplete", value: autocomplete, options: { default: null, isattribute: true } })
			.property({ name: "readonly", value: readonly, options: { default: null }, getter: () => this.find("input").hasAttribute("readonly") })
			.property({ name: "value", value: value, options: { default: null }, getter: () => this.find("input").value });
    }

	connectedCallback ({ style, markup } = {}) {
		super.conditionsCallback();
		super.connectedCallback({
			style: component.template`
				input { display: inline-block; background: transparent; border: 2px solid var(--input-p-1); border-radius: var(--app-textbox-border-radius, 3px); color: var(--input-p-f); padding: var(--app-textbox-padding, 15px); width: 100%; }
				input { font-size: 9pt; font-weight: 400; }
				input:focus { border-color: var(--input-p-3); outline: 0; }
				:host([center="true"]) #input { text-align: center; }

				:host([readonly]) input { border-style: dotted; cursor: default; }

				${style ? style() : ""}
			`,

			markup: component.template`
				<input type="${this.type}" placeholder="${this.placeholder}" autocomplete="${this.autocomplete}" />

				${markup ? markup() : ""}
			`
		});

		// Redirect events.
		this.events.redirect(this.find("input"), "keydown");

		// Handle events.
		this.events.on("readonly updated", _value => {
			if (_value) {
				this.find("input").setAttribute("readonly", "");
				this.setAttribute("readonly", "");
			} else {
				this.find("input").removeAttribute("readonly");
				this.removeAttribute("readonly");
			}
		});

		this.events.on("value updated", _value => {
			this.find("input").value = _value;
		});

		this.events.on("keydown", _event => {
			if (_event.key === "Enter")
				this.events.emit("activated");

			this.events.emit("changed");
		});
	}

	disconnectedCallback () {
		super.disconnectedCallback();
	}

	clear () {
		this.value = "";
	}

	focus () {
		this.find("input").focus();
		this.events.emit("focused");
	}

	blur () {
		this.find("input").blur();
		this.events.emit("blurred");
	}
}

globalThis.customElements.define("app-textbox", textbox);