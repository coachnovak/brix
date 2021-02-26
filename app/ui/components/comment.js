import { base } from "/components/base.js";

export class comment extends base {
	constructor (_properties = {}) {
		super(Object.assign(_properties, {
			isolated: false
        }));

		this
			.property("publisher", _properties.publisher ? _properties.publisher : null)
			.property("text", _properties.text ? _properties.text : null)
			.property("data", _properties.data ? _properties.data : null)
			.property("when", _properties.when ? _properties.when : null);

		this.styles.push(`

		`);

	}

	async connectedCallback () {
		await super.connectedCallback();

		this.append(`
			<div class="comment">
				<div class="avatar"><i class="fad fa-user"></i></div>
				<div class="publisher">${this.publisher}<span class="when" datetime="${this.when}"></span></div>
				<div class="text">${this.text}</div>
			</div>
		`);

		setTimeout(() => this.visible = true, 100);

		const when = this.use(".when", { query: true });
		timeago.render(when);

		this.on("disposing", () => timeago.cancel(when));
	}
}

globalThis.customElements.define("app-comment", comment);