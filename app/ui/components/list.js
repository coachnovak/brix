import { base } from "/components/base.js";
import { listItem } from "/components/list-item.js";

export class list extends base {
	constructor (_properties = {}) {
		super(Object.assign(_properties ? _properties : {}, {

        }));

		this
			.property("count", _properties.count ? _properties.count : 0);

		this.styles.push(`
			:host { display: grid; grid-template-columns: auto; line-height: 100%; }

			/* @media all and (min-width: 276px) {
				:host([break="2"]),
				:host([break="3"]) { grid-template-columns: repeat(2, auto); grid-gap: 15px; }
			} */

			@media all and (min-width: 376px) {
				:host([break="2"]) { grid-template-columns: repeat(2, auto); grid-gap: 15px; }
				:host([break="3"]) { grid-template-columns: repeat(3, auto); grid-gap: 15px; }
			}
		`);
	}

	async connectedCallback () {
		await super.connectedCallback();

	}

	async add (_options) {
		this.count++;
		return this.appendChild(new listItem(_options));
	}

	async clear () {
		this.count = 0;
		Array.from(this.use("app-list-item", { queryAll: true })).forEach(_element => _element.remove());
	}
}

globalThis.customElements.define("app-list", list);