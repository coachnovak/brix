import { base } from "/components/base.js";

export class loader extends base {
	constructor (_properties = {}) {
		super(Object.assign(_properties ? _properties : {}, {

        }));

		this
			.property("size", _properties.size ? _properties.size : "m");

		this.styles.push(`
			:host { display: inline-block; }

			span { border: 3px solid var(--component-e-b); border-bottom-color: var(--component-e-f); border-radius: 50%; }
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
		`);
	}

	async connectedCallback () {
		await super.connectedCallback();

		this.html(`
			${this.html()}
			<span></span>
		`);

		this.emit("ready");
	}
}

globalThis.customElements.define("app-loader", loader);