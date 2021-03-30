import { component } from "/components/component.js";

export class loader extends component {
	constructor (_properties = {}) {
		super({ ..._properties, canfocus: true });

		const { size } = _properties;
		this.property({ name: "size", value: size, options: { default: "m", isattribute: true } });
    }

	connectedCallback ({ style, markup } = {}) {
		super.conditionsCallback();
		super.connectedCallback({
			style: component.template`
				:host { display: inline-block; }

				span { border: 3px solid var(--action-e-1); border-bottom-color: var(--action-e-f); border-radius: 50%; }
				span { display: inline-block; animation: rotation 1s linear infinite; }
		
				:host([size="xs"]) span { width: 15px; height: 15px; border-width: 2px; }
				:host([size="s"]) span { width: 32px; height: 32px; border-width: 3px; }
				:host([size="m"]) span { width: 48px; height: 48px; border-width: 4px; }
				:host([size="l"]) span { width: 64px; height: 64px; border-width: 4px; }
				:host([size="xl"]) span { width: 96px; height: 96px; border-width: 5px; }
		
				@keyframes rotation {
					0% { transform: rotate(0deg); }
					100% { transform: rotate(360deg); }
				}

				${style ? style() : ""}
			`,

			markup: component.template`
				<span></span>

				${markup ? markup() : ""}
			`
		});

		// Redirect events.
		/* None */

		// Handle events.
		/* None */
	}

	disconnectedCallback () {
		super.disconnectedCallback();
	}
}

globalThis.customElements.define("app-loader", loader);