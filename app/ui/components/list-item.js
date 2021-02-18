import { base } from "/components/base.js";

export class listItem extends base {
	constructor (_properties = {}) {
		super(Object.assign(_properties ? _properties : {}, {

        }));

		this
			.property("contents", _properties.contents ? _properties.contents : null)
			.property("data", _properties.data ? _properties.data : null);

		this.styles.push(`
			:host { overflow: hidden; }

			#item { display: grid; grid-gap: 15px; padding: 15px; border-radius: 3px; cursor: pointer; transform: translateY(-100%); }
			#item:hover { background: var(--paper-2); }
			#item[visible="true"] { transform: translateY(0%); }

			#avatar { position: relative; width: 34px; height: 34px; border-radius: 50%; background: var(--paper-3); }
			#avatar i { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); }

			#text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
			#since { white-space: nowrap; }
			#count { white-space: nowrap; opacity: 0.5; }
		`);
	}

	async connectedCallback () {
		await super.connectedCallback();
		this.readInIcons();
		this.tabable();

		let composition = [];
		let elements = [];

		this.contents.forEach(_content => {
			if (_content.avatar) {
				composition.push("min-content");
				elements.push(`<div id="avatar"><i class="fad fa-${_content.avatar}"></i></div>`);
			} else if (_content.text) {
				composition.push("auto");
				elements.push(`<div id="text">${_content.text}</div>`);
			} else if (_content.since) {
				composition.push("min-content");
				elements.push(`<div id="since" datetime="${_content.since}"></div>`);
			} else if (_content.count) {
				composition.push("min-content");
				elements.push(`<div id="count">${_content.count}</div>`);
			} else if (_content.icon) {
				composition.push("min-content");
				elements.push(`<i class="fad fa-${_content.icon}"></i>`);
			} else if (_content.arrow) {
				composition.push("min-content");
				elements.push(`<i class="fad fa-arrow-right"></i>`);
			}
		});

		this.append(`
			<style>
				#item { grid-template-columns: ${composition.join(" ")}; }
			</style>

			<div id="item">${elements.join("")}</div>
		`);

		setTimeout(() => this.use("item").setAttribute("visible", "true"), 100);
		
		this.on("click", _event => this.emit("activated", { id: this.id, data: this.data }));
		this.on("keydown", _event => { if (_event.key ==="Enter") this.emit("activated", { id: this.id, data: this.data }) });

		const since = this.use("since");
		if (since) timeago.render(since);

		this.on("disposing", () => {
			if (since) timeago.cancel(since);
		});
	}
}

globalThis.customElements.define("app-list-item", listItem);