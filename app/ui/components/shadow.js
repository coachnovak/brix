import { base } from "/components/base.js";

export class shadow extends base {
	constructor (_properties = {}) {
		super(Object.assign(_properties ? _properties : {}, {
			isolated: false
        }));
	}

	async connectedCallback () {
		await super.connectedCallback();

		this.on("click", () => this.emit("activated"));
	}

	async close () {
		this.remove();
	}
}

globalThis.customElements.define("app-shadow", shadow);