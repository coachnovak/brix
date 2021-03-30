import { component } from "/components/component.js";
import { listitem } from "/components/listitem.js";

export class list extends component {
	constructor (_properties = {}) {
		super({ ..._properties });

		this.property({ name: "count", value: undefined, options: { default: 0, isattribute: true } });
    }

	async connectedCallback ({ style, markup } = {}) {
		await super.connectedCallback({
			style: component.template`
				:host { display: grid; grid-template-columns: auto; line-height: 100%; }

				/* @media all and (min-width: 276px) {
					:host([break="2"]),
					:host([break="3"]) { grid-template-columns: repeat(2, auto); grid-gap: 15px; }
				} */
		
				@media all and (min-width: 376px) {
					:host([break="2"]) { grid-template-columns: repeat(2, auto); grid-gap: 15px; }
					:host([break="3"]) { grid-template-columns: repeat(3, auto); grid-gap: 15px; }
				}

				${style ? style() : ""}
			`,

			markup: component.template`
				${markup ? markup() : ""}
			`
		});

		// Redirect events.
		/* None */

		// Handle events.
		/* None */
	}

	async disconnectedCallback () {
		await super.disconnectedCallback();
	}

	async add (_item) {
		this.count++;
		return this.append(new listitem(_item));
	}

	async clear () {
		this.count = 0;

		Array.from(this.children())
			.filter(_child => _child.tagName.toLowerCase() === "app-listitem")
			.forEach(_element => _element.remove());
	}
}

globalThis.customElements.define("app-list", list);