import { component } from "/components/component.js";
import { textbox } from "/components/textbox.js";
import analyze from "/components/password-analyze.js";

export class password extends textbox {
	constructor (_properties = {}) {
		super({ ..._properties, type: "password" });
    }

	connectedCallback ({ style, markup } = {}) {
		super.conditionsCallback();
		super.connectedCallback({
			style: component.template`

				${style ? style() : ""}
			`,

			markup: component.template`

				${markup ? markup() : ""}
			`
		});
	}

	disconnectedCallback () {
		super.disconnectedCallback();
	}

	evaluate () {
		return analyze(this.value);
	}
}

globalThis.customElements.define("app-password", password);