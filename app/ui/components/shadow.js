import { component } from "/components/component.js";

export class shadow extends component {
	constructor (_properties = {}) {
		super({ ..._properties, canfocus: true });
    }

	connectedCallback ({ style, markup } = {}) {
		super.conditionsCallback();
		super.connectedCallback({
			style: component.template`
				:host { display: block; position: fixed; left: 0; top: 0; right: 0; bottom: 0; opacity: 0.3; background: rgb(0, 0, 0); }

				${style ? style() : ""}
			`,

			markup: component.template`

				${markup ? markup() : ""}
			`
		});

		// Redirect events.
		this.events.redirect(this, "click", "activated");

		// Handle events.
		/* None */
	}

	disconnectedCallback () {
		super.disconnectedCallback();
	}

	close () {
		this.remove();
	}
}

globalThis.customElements.define("app-shadow", shadow);