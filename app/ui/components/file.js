import { component } from "/components/component.js";

export class file extends component {
	constructor (_properties = {}) {
		super({ ..._properties, canfocus: true });

		const { size, clickable } = _properties;
		this.property({ name: "size", value: size, options: { default: "m", isattribute: true } })
			.property({ name: "files", value: [], options: { default: [] }, getter: () => this.find("input").files });
    }

	connectedCallback ({ style, markup } = {}) {
		super.conditionsCallback();
		super.connectedCallback({
			style: component.template`
				:host([size=s]) { --size: 140px; }
				:host([size=m]) { --size: 210px; }
				:host([size=l]) { --size: 280px; }

				:host { display: block; position: relative; height: var(--size); border: 2px dashed var(--action-p-1); border-radius: var(--spacing); cursor: pointer; outline: 0 }
				:host(:hover) { border-color: var(--action-p-2); }
				:host(:focus) { border-color: var(--action-p-3); }

				input { display: none; }

				#dropinfo { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); text-align: center; opacity: 0.5; }
				#dropinfo i { font-size: 48pt; }

				${style ? style() : ""}
			`,

			markup: component.template`
				<input type="file" />

				<div id="dropinfo">
					<i class="fad fa-files-medical"></i><br />
					<br />
					Click to select or drop a file here...
				</div>

				${markup ? markup() : ""}
			`
		});

		// Redirect events.
		this.events.redirect(this.find("input"), "change");
		this.events.redirect(this, "click");
		this.events.redirect(this, "keydown");

		// Handle events.
		this.events.on("change", () => this.events.emit("selected", this.files));
		this.events.on("click", () => this.select());
		this.events.on("keydown", _event => { _event.key === "Enter" && this.events.emit("click") });
	}

	disconnectedCallback () {
		super.disconnectedCallback();
	}

	select () {
		this.find("input").click();
	}
}

globalThis.customElements.define("app-file", file);