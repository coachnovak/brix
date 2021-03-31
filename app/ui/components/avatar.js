import { component } from "/components/component.js";

export class avatar extends component {
	constructor (_properties = {}) {
		super({ ..._properties });

		const { size, clickable, user } = _properties;
		this.property({ name: "size", value: size, options: { default: "m", isattribute: true } })
			.property({ name: "clickable", value: clickable, options: { default: "false", isattribute: true } })
			.property({ name: "user", value: user, options: { default: undefined } });
    }

	connectedCallback ({ style, markup } = {}) {
		super.connectedCallback({
			style: component.template`
				:host([size=xxs]) { --size: 15px; }
				:host([size=s]) { --size: 40px; }
				:host([size=m]) { --size: 90px; }
				:host([size=l]) { --size: 150px; }

				:host { display: inline-block; background: var(--paper-1); background-size: cover; background-repeat: no-repeat; border-radius: 50%; width: var(--size); height: var(--size); }
				:host([clickable="true"]) { cursor: pointer; border: 4px solid var(--paper-1); }

				:host(:hover) { border-color: var(--action-p-2); }
				:host(:focus) { border-color: var(--action-p-3); }

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
		await globalThis.fetcher(`/api/${this.user ? "user" : "my"}/avatar/${this.user ? this.user._id : ""}`, {
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
			},
			404: async _response => {
				this.style.backgroundImage = `url(${await this.generate()})`;
			}
		});
	}

	async generate () {
		const firstName = (this.user ? this.user.firstName : globalThis.session.identity.firstName).substring(0, 1);
		const lastName = (this.user ? this.user.lastName : globalThis.session.identity.lastName).substring(0, 1);
		const text = `${firstName.toUpperCase()} ${lastName.toUpperCase()}`;

		const background = getComputedStyle(document.documentElement).getPropertyValue("--paper-2");
		const foreground = getComputedStyle(document.documentElement).getPropertyValue("--pen-1");
		const size = parseInt(getComputedStyle(this).getPropertyValue("--size"));

		const canvas = document.createElement("canvas");
		canvas.width = size;
		canvas.height = size;

		const context = canvas.getContext("2d");
		context.fillStyle = background;
		context.fillRect(0, 0, canvas.width, canvas.height);

		const font = `${size / 4}px 'Roboto', sans-serif`;
		await document.fonts.load(font);

		context.font = font;
		context.fillStyle = foreground;
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.fillText(text, canvas.width / 2, (canvas.height / 2) + 1);

		return canvas.toDataURL("image/png");
	}
}

globalThis.customElements.define("app-avatar", avatar);