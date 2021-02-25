import { base } from "/components/base.js";

export class reaction extends base {
	constructor (_properties = {}) {
		super(Object.assign(_properties ? _properties : {}, {
			isolated: false
        }));

		this
			.property("sender", _properties.sender)
			.property("reaction", _properties.reaction)
			.property("when", _properties.when);

		this.styles.push(`

		`);

	}

	async connectedCallback () {
		await super.connectedCallback();
		const reactions = ["thumbs-up", "heart", "grin-squint", "surprise", "sad-tear", "angry"];

		this.append(`
			<div class="reaction">
				<div class="sender">${this.sender} reacted <span class="when" datetime="${this.when}"></span> with <i class="fad fa-${reactions[this.reaction]}"></i>.</div>
			</div>
		`);

		setTimeout(() => this.visible = true, 100);

		const when = this.use(".when", { query: true });
		timeago.render(when);

		this.on("disposing", () => timeago.cancel(when));
	}
}

globalThis.customElements.define("app-reaction", reaction);