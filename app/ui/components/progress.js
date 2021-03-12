import { base } from "/components/base.js";

export class progress extends base {
	constructor (_properties = {}) {
		_properties = Object.assign({
			max: 0,
			current: 0
        }, _properties);

		super(_properties);

		this
			.property("max", _properties.max)
			.property("current", _properties.current);

		this.styles.push(`
			:host { position: relative; background: var(--component-e-b); width: 100%; height: 3px; }
			#current { position: absolute; left: 0; top: 0; bottom: 0; background: var(--component-e-f); }
		`);
	}

	async connectedCallback () {
		await super.connectedCallback();

		this.html(`
			${this.html()}
			<div><div id="current"></div></div>
		`);

		this.on("max updated", () => this.render());
		this.on("current updated", () => this.render());

		await this.render();
		this.emit("ready");
	}

	async render () {
		const currentElement = this.use("current");

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