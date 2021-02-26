import { base } from "/components/base.js";
import { optionHeader } from "/components/option-header.js";
import { optionActions } from "/components/option-actions.js";

export class option extends base {
	constructor (_properties) {
		super(Object.assign(_properties ? _properties : {}, {

        }));

		this.styles.push(`
			:host { display: grid; grid-gap: 20px; border: 1px solid var(--paper-2); padding: 20px; }
			:host { border-radius: 3px; }
		`);
	}

	async connectedCallback () {
		await super.connectedCallback();

	}

	async addHeader (_options) {
		return this.appendChild(new optionHeader(_options));
	}

	async addActions (_options) {
		return this.appendChild(new optionActions(_options));
	}
}

globalThis.customElements.define("app-option", option);