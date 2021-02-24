import { base } from "/components/base.js";

export class article extends base {
	constructor (_properties = {}) {
		super(Object.assign(_properties ? _properties : {}, {
			isolated: false
        }));

		this
			.property("name", _properties.name ? _properties.name : null)
			.property("parameters", _properties.parameters ? _properties.parameters : {}, { attribute: false })
			.property("position", _properties.position ? _properties.position : "center")
			.property("nooverflow", _properties.nooverflow ? _properties.nooverflow : false)
			.property("show", _properties.show ? _properties.show : false)
			.property("full", _properties.full ? _properties.full : false)
			.property("grow", _properties.grow ? _properties.grow : false)
			.property("shadow", _properties.shadow ? _properties.shadow : null, { attribute: false });
	}

	async connectedCallback () {
		await super.connectedCallback();

		if (this.name !== "") {
			this.instance = (await import(`/articles/${this.name}.js`)).default;

			if (this.instance.options) {
				this.nooverflow = this.instance.options.nooverflow ? this.instance.options.nooverflow : this.nooverflow;
				this.position = this.instance.options.position ? this.instance.options.position : this.position;
				this.full = this.instance.options.full ? this.instance.options.full : this.full;
				this.grow = this.instance.options.grow ? this.instance.options.grow : this.grow;
			}

			this.append(`
				<style>
					${this.instance.styles}
				</style>

				${this.instance.markup}
			`);

			await this.instance.script(this);
			setTimeout(() => this.show = true, 10);
		}
	}

	async close (_action = "closed", _parameters = {}) {
		// Emit closure event.
		this.emit(_action, { data: _parameters });

		// If shadow is attached, remove.
		if (this.shadow) this.shadow.remove();

		// Remove self.
		this.remove();
	}
}

globalThis.customElements.define("app-article", article);