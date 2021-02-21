import { base } from "/components/base.js";

export class article extends base {
	constructor (_properties = {}) {
		super(Object.assign(_properties ? _properties : {}, {
			isolated: false
        }));

		this
			.property("name", _properties.name ? _properties.name : null)
			.property("parameters", _properties.parameters ? _properties.parameters : {})
			.property("slidein", _properties.slidein ? _properties.slidein : false)
			.property("full", _properties.full ? _properties.full : false)
			.property("grow", _properties.grow ? _properties.grow : false);
	}

	async connectedCallback () {
		await super.connectedCallback();

		if (this.article !== "") {
			const articleInstance = (await import(`/articles/${this.name}.js`)).default;

			if (articleInstance.options) {
				this.full = articleInstance.options.full ? articleInstance.options.full : this.full;
				this.grow = articleInstance.options.grow ? articleInstance.options.grow : this.grow;
			}

			this.append(`
				<style>
					${articleInstance.styles}
				</style>

				${articleInstance.markup}
			`);

			await articleInstance.script(this);
			this.slidein = true;
		}
	}

	async close () {
		this.remove();
	}
}

globalThis.customElements.define("app-article", article);