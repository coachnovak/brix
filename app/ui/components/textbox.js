import { base } from "/components/base.js";

export class textbox extends base {
	constructor (_properties = {}) {
		super(Object.assign(_properties ? _properties : {}, {

        }));

		this
			.property("placeholder", _properties.placeholder ? _properties.placeholder : null)
			.property("type", _properties.type ? _properties.type : null)
			.property("center", _properties.center ? _properties.center : null);

        this.styles.push(`
			#input { display: inline-block; background: var(--paper-2); border: 0px; color: var(--pen-1); padding: 15px; border-radius: 3px; width: 100%; }
			#input { font-size: 9pt; font-weight: 400; }
			#input:focus { outline: 0; }
			:host([center="true"]) #input { text-align: center; }
		`);
	}

	async connectedCallback () {
		await super.connectedCallback();

		this.append(`<input type="${this.type}" id="input" placeholder="${this.placeholder}" />`);
		this.on("placeholder updated", _event => { this.use("input").setAttribute("placeholder", _event.detail); });

		this.use("input").addEventListener("keydown", _event => { if (_event.key ==="Enter") this.emit("activated") });
		this.use("input").addEventListener("keydown", _event => this.emit("changed"));

		this.emit("ready");
	}

	value (_value) {
		if (_value) this.use("input").value = _value
		else return this.use("input").value;
	}

	clear () {
		this.use("input").value = "";
	}

	focus () {
		this.use("input").focus();
	}
}

globalThis.customElements.define("app-textbox", textbox);