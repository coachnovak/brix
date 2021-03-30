import { component } from "/components/component.js";

export class progress extends component {
	constructor (_properties = {}) {
		super({ ..._properties, canfocus: true });

		const { max, current } = _properties;
		this.property({ name: "max", value: max, options: { default: 0 } })
			.property({ name: "current", value: current, options: { default: 0 } });
    }

	connectedCallback ({ style, markup } = {}) {
		super.conditionsCallback();
		super.connectedCallback({
			style: component.template`
				:host { position: relative; background: var(--action-e-1); width: 100%; height: 3px; }
				#current { position: absolute; left: 0; top: 0; bottom: 0; background: var(--action-e-f); transition-property: width; }

				${style ? style() : ""}
			`,

			markup: component.template`
				<div><div id="current"></div></div>

				${markup ? markup() : ""}
			`
		});

		// Initial render.
		this.render();

		// Redirect events.
		/* None */

		// Handle events.
		this.events.on("max updated", () => this.render());
		this.events.on("current updated", () => this.render());
	}

	disconnectedCallback () {
		super.disconnectedCallback();
	}

	render () {
		const currentElement = this.find("#current");

		if (this.current === 0) {
			currentElement.style.width = "0%";
		} else if (this.current >= this.max) {
			currentElement.style.width = "100%";
		} else {
			const percentage = (this.current / this.max) * 100;
			currentElement.style.width = `${percentage}%`;
		}
	}
}

globalThis.customElements.define("app-progress", progress);