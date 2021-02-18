import { base } from "/components/base.js";
import { option } from "/components/option.js";

export class options extends base {
	constructor (_properties) {
		super(Object.assign(_properties ? _properties : {}, {

        }));

		this.styles.push(`
			:host { display: grid; grid-template-columns: auto; grid-gap: 20px; grid-auto-flow: row; }

			@media all and (min-width: 576px) {
				:host { grid-template-columns: minmax(200px, 248px); grid-auto-flow: column; }
			}
		`);
	}

	async connectedCallback () {
		await super.connectedCallback();

	}

	async add () {
		return this.appendChild(new option());
	}
}

globalThis.customElements.define("app-options", options);