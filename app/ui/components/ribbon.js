import { component } from "/components/component.js";

export class ribbon extends component {
	constructor (_properties = {}) {
		super({ ..._properties });

		const { text } = _properties;
		this.property({ name: "text", value: text, options: { default: null, isattribute: true } });
    }

	connectedCallback ({ style, markup } = {}) {
		super.conditionsCallback();
		super.connectedCallback({
			style: component.template`
				:host { position: relative; width: calc(100% + (var(--spacing) * 2) + 10px); margin-left: calc(-5px - var(--spacing)); margin-right: calc(-5px - var(--spacing)); background: var(--paper-3); box-shadow: var(--paper-s) }
				:host:before { width: 0; height: 0; border-left: 5px solid transparent; border-top: 5px solid var(--paper-1); bottom: -5px; position: absolute; content: ""; }
				:host:after { width: 0; height: 0; border-top: 5px solid var(--paper-1); border-right: 5px solid transparent; right: 0; bottom: -5px; position: absolute; content: ""; }
		
				#text { text-align: center; padding: 15px; }

				${style ? style() : ""}
			`,

			markup: component.template`
				<div id="text">${this.text}</div>

				${markup ? markup() : ""}
			`
		});

		// Redirect events.
		/* None */

		// Handle events.
		this.events.on("text updated", _value => this.render());
	}

	disconnectedCallback () {
		super.disconnectedCallback();
	}
}

globalThis.customElements.define("app-ribbon", ribbon);