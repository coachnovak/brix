import { component } from "/components/component.js";

export class listitem extends component {
	constructor (_properties = {}) {
		const { clickable = true, contents, data } = _properties;
		super({ ..._properties, canfocus: clickable });

		this.property({ name: "clickable", value: clickable, options: { default: true, isattribute: true } })
			.property({ name: "contents", value: contents, options: { default: [] } })
			.property({ name: "data", value: data, options: { default: null } });
    }

	connectedCallback ({ style, markup } = {}) {
		super.conditionsCallback();
		super.connectedCallback({
			style: component.template`
				:host { overflow: hidden; }
				:host([clickable="true"]:hover) #item { background: var(--action-e-2); cursor: pointer; }
		
				#item { display: grid; grid-gap: 15px; padding: 15px; border-radius: 3px; }
				#avatar { position: relative; width: 34px; height: 34px; border-radius: 50%; background: var(--paper-3); }
				#avatar i { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); }
		
				#text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
				#since { white-space: nowrap; }
				#until { white-space: nowrap; }
				#count { white-space: nowrap; opacity: 0.5; }

				${style ? style() : ""}
			`,

			markup: component.template`
				${markup ? markup() : ""}
			`
		});

		// Initial render.
		this.render();

		// Redirect events.
		this.events.redirect(this, "click");
		this.events.redirect(this, "keydown");

		// Handle events.
		this.events.on("click", _event => this.events.emit("activated", { id: this.id, data: this.data }));
		this.events.on("keydown", _event => _event.key === "Enter" && this.events.emit("activated", { id: this.id, data: this.data }));
		this.events.on("clickable updated", _value => this.canfocus = _value);
	}

	disconnectedCallback () {
		super.disconnectedCallback();
	}

	render () {
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
			} else if (_content.delete !== undefined) {
				composition.push("min-content");
				elements.push(`<i class="fad fa-times"></i>`);
			}
		});

		const templateElement = document.createElement("template");
		templateElement.innerHTML = `<style>#item { grid-template-columns: ${composition.join(" ")}; }</style><div id="item">${elements.join("")}</div>`;
		this.append(templateElement.content.cloneNode(true));

		const since = this.find("#since");
		if (since) timeago.render(since);

		const until = this.find("#until > span");
		if (until) timeago.render(until);

		this.events.on("disposed", () => {
			if (since) timeago.cancel(since);
			if (until) timeago.cancel(until);
		});
	}
}

globalThis.customElements.define("app-listitem", listitem);