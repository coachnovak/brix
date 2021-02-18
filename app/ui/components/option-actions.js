import { base } from "/components/base.js";
import { button } from "/components/button.js";

export class optionActions extends base {
	constructor (_properties) {
		super(Object.assign(_properties ? _properties : {}, {

		}));
		
		this.styles.push(`
			:host { text-align: right; }
		`);
	}

	async connectedCallback () {
		await super.connectedCallback();

	}

	async addButton (_options) {
		return this.appendChild(new button(_options));
	}
}

globalThis.customElements.define("app-option-actions", optionActions);