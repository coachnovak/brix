import { base } from "/components/base.js";

export class button extends base {
	constructor (_properties = {}) {
		super(Object.assign(_properties ? _properties : {}, {

        }));

		this
			.property("text", _properties.text ? _properties.text : null)
			.property("icon", _properties.icon ? _properties.icon : null)
			.property("size", _properties.size ? _properties.size : null)
			.property("secondary", _properties.secondary ? _properties.secondary : null)
			.property("embedded", _properties.embedded ? _properties.embedded : null)
			.property("composition", _properties.composition ? _properties.composition : null);

		this.styles.push(`
			:host { user-select: none; }
			:host { display: inline-grid; background: var(--button-p-b); color: var(--button-p-f); border: 2px solid transparent; border-radius: 3px; padding: 13px; grid-gap: 9px; align-items: center; justify-content: center; align-content: center; letter-spacing: 1px; cursor: pointer; white-space: nowrap; outline: 0; }
			:host([secondary="true"]) { background: var(--button-s-b); color: var(--button-s-f); }
			:host([embedded="true"]) { background: var(--button-e-b); color: var(--button-e-f); }

			:host([composition*="vertical"]) { text-align: center; }
			:host([composition="text icon"]) { grid-template-columns: auto min-content; }
			:host([composition="vertical text icon"]) { grid-template-rows: auto min-content; }
			:host([composition="icon text"]) { grid-template-columns: min-content auto; }
			:host([composition="vertical icon text"]) { grid-template-rows: min-content auto; }
			:host([composition="text"]),
			:host([composition="icon"]) { grid-template-columns: auto; }
			:host([composition="vertical text"]),
			:host([composition="vertical icon"]) { grid-template-rows: auto; }

			:host(:hover) { background: var(--button-p-h); }
			:host(:focus) { border-color: var(--button-p-a); }

			:host([secondary="true"]:hover) { background: var(--button-s-h); }
			:host([secondary="true"]:focus) { border-color: var(--button-s-a); }

			:host([embedded="true"]:hover) { background: var(--button-e-h); }
			:host([embedded="true"]:focus) { border-color: var(--button-e-a); }

			i { font-size: 10pt; }

			:host([size="large"]) { padding: 8px; }
			:host([size="large"]) i { font-size: 18pt; }
		`);
	}

	async connectedCallback () {
		await super.connectedCallback();
		this.tabable();
		this.readInIcons();
		this.render();

		this.on("click", () => this.emit("activated"));
		this.on("keydown", _event => { if (_event.key ==="Enter") this.emit("activated") });

		this.on("mousedown", () => this.emit("hold"));
		this.on("touchstart", () => this.emit("hold"));

		this.on("mouseup", () => this.emit("release"));
		this.on("touchend", () => this.emit("release"));

		this.emit("ready");
	}

	async render () {
		const textElement = this.use("text");
		if (textElement) textElement.remove();

		const iconElement = this.use("icon");
		if (iconElement) iconElement.remove();

		this.composition.split(" ").forEach(_type => {
			const value = this[_type];

			switch (_type) {
				case "text": this.append(`<div id="text">${value}</div>`); break;
				case "icon": this.append(`<i id="icon" class="fad fa-${value}"></i>`); break;
			}
		});
	}
}

globalThis.customElements.define("app-button", button);