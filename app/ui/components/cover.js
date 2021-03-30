import { component } from "/components/component.js";

export class cover extends component {
	constructor (_properties = {}) {
		super({ ..._properties });

		const { size, clickable } = _properties;
		this.property({ name: "size", value: size, options: { default: "m", isattribute: true } })
			.property({ name: "clickable", value: clickable, options: { default: "false", isattribute: true } });
    }

	connectedCallback ({ style, markup } = {}) {
		super.connectedCallback({
			style: component.template`
				:host([size=s]) { --size: 140px; }
				:host([size=m]) { --size: 210px; }
				:host([size=l]) { --size: 280px; }

				:host { display: inline-block; background: var(--paper-3); background-size: cover; background-repeat: no-repeat; background-position: center; filter: opacity(75%); width: 100%; height: var(--size); }
				:host([clickable="true"]) { cursor: pointer; }

				:host([clickable="true"]:hover) { border: 2px solid var(--action-p-2); }
				:host([clickable="true"]:focus) { border: 2px solid var(--action-p-3); }

				${style ? style() : ""}
			`,

			markup: component.template`
				${markup ? markup() : ""}
			`
		});

		// Redirect events.
		this.events.redirect(this, "click", "activated");
		this.events.redirect(this, "keydown");

		// Handle events.
		this.events.on("clickable updated", _value => {
			this.canfocus = _value === "true";
		});

		this.events.on("keydown", _event => {
			_event.key === "Enter" && this.events.emit("activated");
		});

		this.refresh();
	}

	disconnectedCallback () {
		super.disconnectedCallback();
	}

	async refresh () {
		await globalThis.fetcher(`/api/my/cover/`, {
			method: "get"
		}, {
			200: async _response => {
				const buffer = await _response.arrayBuffer();
				const blob = new Blob([buffer]);
				const url = URL.createObjectURL(blob);
				this.style.backgroundImage = `url(${url})`;
			},
			401: async _response => {
				const { message } = await _response.json();
				globalThis.notify([{ icon: "exclamation-triangle" }, { text: message }]).close(3000);
				this.style.backgroundImage = `url(/assets/profile-cover.svg)`;
			},
			404: async _response => {
				this.style.backgroundImage = `url(/assets/profile-cover.svg)`;
			}
		});
	}
}

globalThis.customElements.define("app-cover", cover);