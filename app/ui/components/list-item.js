import { base } from "/components/base.js";

export class listItem extends base {
	constructor (_properties = {}) {
		super(_properties);

		this
			.property("clickable", _properties.clickable !== null && _properties.clickable !== undefined ? _properties.clickable : true)
			.property("contents", _properties.contents ? _properties.contents : null)
			.property("data", _properties.data ? _properties.data : null);

		this.styles.push(`
			:host { overflow: hidden; }
			:host([clickable="true"]:hover) #item { background: var(--component-e-h); cursor: pointer; }

			#item { display: grid; grid-gap: 15px; padding: 15px; border-radius: 3px; transform: translateY(-100%); }
			#item[visible="true"] { transform: translateY(0%); }

			#avatar { position: relative; width: 34px; height: 34px; border-radius: 50%; background: var(--paper-3); }
			#avatar i { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); }

			#text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
			#since { white-space: nowrap; }
			#until { white-space: nowrap; }
			#count { white-space: nowrap; opacity: 0.5; }
		`);
	}

	async connectedCallback () {
		await super.connectedCallback();
		this.readInIcons();

		if (this.clickable)
			this.tabable();

		let composition = [];
		let elements = [];

		this.contents.forEach(_content => {
			if (_content.avatar !== undefined) {
				composition.push("min-content");
				elements.push(`<div id="avatar"><i class="fad fa-${_content.avatar}"></i></div>`);
			} else if (_content.text !== undefined) {
				composition.push("auto");
				elements.push(`<div id="text">${_content.text}</div>`);
			} else if (_content.since !== undefined) {
				composition.push("min-content");
				elements.push(`<div id="since" datetime="${_content.since}"></div>`);
			} else if (_content.until !== undefined) {
				composition.push("min-content");
				if (_content.until) elements.push(`<div id="until">expires <span datetime="${_content.until}"></span></div>`);
				else elements.push(`<div id="until">won't expire</div>`);
			} else if (_content.count !== undefined) {
				composition.push("min-content");
				elements.push(`<div id="count">${_content.count}</div>`);
			} else if (_content.icon !== undefined) {
				composition.push("min-content");
				elements.push(`<i class="fad fa-${_content.icon}"></i>`);
			} else if (_content.arrow !== undefined) {
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

		const until = this.use("#until > span", { query: true });
		if (until) timeago.render(until);

		this.on("disposing", () => {
			if (since) timeago.cancel(since);
			if (until) timeago.cancel(until);
		});
	}
}

globalThis.customElements.define("app-list-item", listItem);