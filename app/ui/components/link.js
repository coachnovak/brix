import { component } from "/components/component.js";

export class link extends component {
	constructor (_properties = {}) {
		super({ ..._properties, canfocus: true });

		const { text, size } = _properties;
		this.property({ name: "text", value: text, options: { default: null, isattribute: true } })
			.property({ name: "size", value: size, options: { default: null, isattribute: true } });
    }

	connectedCallback ({ style, markup } = {}) {
		super.conditionsCallback();
		super.connectedCallback({
			style: component.template`
				:host { display: inline-block; user-select: none; touch-action: none; cursor: pointer; }
				:host { color: var(--action-s-1); }
				:host(:hover) { color: var(--action-s-2); text-decoration: underline; }
				:host(:active) { color: var(--action-s-3); }
		
				:host([size="small"]) { font-size: 80%; }

				${style ? style() : ""}
			`,

			markup: component.template`
				${this.text}

				${markup ? markup() : ""}
			`
		});

		// Redirect events.
		this.events.redirect(this, "click", "activated");
		this.events.redirect(this, "keydown");

		this.events.redirect(this, "contextmenu", "options");

		// Handle events.
		this.events.on("text updated", _value => this.html(_value));

		this.events.on("keydown", _event => {
			_event.key === "Enter" && this.events.emit("activated");
			this.events.emit("changed");
		});

		this.events.on("options", _event => _event.preventDefault() & _event.stopPropagation());
	}

	disconnectedCallback () {
		super.disconnectedCallback();
	}
}

globalThis.customElements.define("app-link", link);