import { base } from "/components/base.js";

export class comment extends base {
	constructor (_properties = {}) {
		super(Object.assign(_properties, {

        }));

		this
			.property("publisher", _properties.publisher ? _properties.publisher : null)
			.property("text", _properties.text ? _properties.text : null)
			.property("data", _properties.data ? _properties.data : null)
			.property("when", _properties.when ? _properties.when : null);

		this.styles.push(`
			:host { overflow: hidden; }

			#item { display: grid; grid-gap: 5px 5px; grid-template-columns: min-content auto; grid-template-rows: auto auto; padding: 5px; border-radius: 3px; transform: translateY(100%); }
			#item { border: 1px solid var(--paper-2); }
			#item[visible="true"] { transform: translateY(0%); }

			#avatar { position: relative; width: 34px; height: 34px; border-radius: 50%; background: var(--paper-3); grid-area: 1 / 1 / 3 / 2; }
			#avatar i { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); }

			#publisher { position: relative; font-size: 7pt; font-weight: 700; grid-area: 1 / 2 / 3 / 3; }
			#text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; grid-area: 2 / 2 / 3 / 3; }
			#when { opacity: 0.75; position: absolute; top: 0; right: 0; }

			@media all and (min-width: 376px) {
				#avatar { }
			}
		`);
	}

	async connectedCallback () {
		await super.connectedCallback();
		this.readInIcons();

		this.append(`
			<div id="item">
				<div id="avatar"><i class="fad fa-user"></i></div>
				<div id="publisher">${this.publisher}<span id="when" datetime="${this.when}"></span></div>
				<div id="text">${this.text}</div>
			</div>
		`);

		setTimeout(() => this.use("item").setAttribute("visible", "true"), 100);
		this.on("click", () => this.emit("activated", { id: this.id }));

		const when = this.use("when");
		timeago.render(when);

		this.on("disposing", () => {
			timeago.cancel(when);
		});
	}
}

globalThis.customElements.define("app-comment", comment);