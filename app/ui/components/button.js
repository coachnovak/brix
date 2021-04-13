import { component } from "/components/component.js";
import { image } from "/components/image.js";
import { label } from "/components/label.js";

export class button extends component {
	constructor (_properties = {}) {
		super({ ..._properties, canfocus: true });

		const { text, icon, size, secondary, embedded, composition, round, glow, tiptext, tipplacement } = _properties;
		this.property({ name: "text", value: text, options: { default: null, isattribute: true } })
			.property({ name: "icon", value: icon, options: { default: null, isattribute: true } })
			.property({ name: "size", value: size, options: { default: null, isattribute: true } })

			.property({ name: "secondary", value: secondary, options: { default: null, isattribute: true } })
			.property({ name: "embedded", value: embedded, options: { default: null, isattribute: true } })
			.property({ name: "composition", value: composition, options: { default: null, isattribute: true } })

			.property({ name: "round", value: round, options: { default: false, isattribute: true } })
			.property({ name: "glow", value: glow, options: { default: false, isattribute: true } })
			
			.property({ name: "tiptext", value: tiptext, options: { default: "", isattribute: true } })
			.property({ name: "tipplacement", value: tipplacement, options: { default: "auto", isattribute: true } });
    }

	connectedCallback ({ style, markup } = {}) {
		super.conditionsCallback();
		super.connectedCallback({
			style: component.template`
				:host { user-select: none; touch-action: none; }
				:host { display: inline-grid; background: var(--action-p-1); color: var(--action-p-f); border: 2px solid transparent; border-radius: 3px; padding: 13px; grid-gap: 9px; align-items: center; justify-content: center; align-content: center; letter-spacing: 1px; cursor: pointer; white-space: nowrap; outline: 0; box-shadow: var(--action-p-s); }
				:host([secondary="true"]) { background: var(--action-s-1); color: var(--action-s-f); box-shadow: var(--action-s-s); }
				:host([embedded="true"]) { background: var(--action-e-1); color: var(--action-e-f);  box-shadow: var(--action-e-s); }
		
				:host([composition*="vertical"]) { text-align: center; }
				:host([composition="text icon"]) { grid-template-columns: auto min-content; }
				:host([composition="vertical text icon"]) { grid-template-rows: auto min-content; }
				:host([composition="icon text"]) { grid-template-columns: min-content auto; }
				:host([composition="vertical icon text"]) { grid-template-rows: min-content auto; }
				:host([composition="text"]),
				:host([composition="icon"]) { grid-template-columns: auto; }
				:host([composition="vertical text"]),
				:host([composition="vertical icon"]) { grid-template-rows: auto; }
		
				:host([round="true"]) { border-radius: 50%; }
				:host([glow="true"]) { animation: glow 1.5s ease-in-out 6 alternate; }
		
				:host(:hover) { background: var(--action-p-2); }
				:host(:focus) { border-color: var(--action-p-3); }
		
				:host([secondary="true"]:hover) { background: var(--action-s-2); }
				:host([secondary="true"]:focus) { border-color: var(--action-s-2); }
		
				:host([embedded="true"]:hover) { background: var(--action-e-2); }
				:host([embedded="true"]:focus) { border-color: var(--action-e-3); }

				app-image { font-size: 10pt; }

				:host([size="large"]) { padding: 8px; min-width: 44px; }
				:host([size="large"]) app-image { font-size: 20px; }
		
				:host([size="huge"]) { padding: 10px; min-width: 67px; }
				:host([size="huge"]) app-image { font-size: 36px; }
		
				@keyframes glow {
					from { box-shadow: 0 0 -5px -0 rgba(255, 255, 255, 0.75); }
					to { box-shadow: 0 0 80px 0 rgba(255, 255, 255, 0.75); }
				}

				${style ? style() : ""}
			`,

			markup: component.template`
				${markup ? markup() : ""}
			`
		});

		// Initial render.
		this.render();

		// Set up tippy.
		if (this.tiptext)
			this.tippy = tippy(this, {
				arrow: true,
				placement: this.tipplacement,
				touch: "hold",
				allowHTML: true,
				theme: "custom",
				content: _target => {
					return _target["tiptext"];
				}
			});

		// Redirect events.
		this.events.redirect(this, "click", "activated");
		this.events.redirect(this, "keydown");

		this.events.redirect(this, "mousedown", "hold");
		this.events.redirect(this, "touchstart", "hold");

		this.events.redirect(this, "mouseup", "release");
		this.events.redirect(this, "touchend", "release");

		this.events.redirect(this, "contextmenu", "options");

		// Handle events.
		this.events.on("text updated", _value => this.render());
		this.events.on("icon updated", _value => this.render());

		this.events.on("keydown", _event => {
			_event.key === "Enter" && this.events.emit("activated");
			this.events.emit("changed");
		});

		this.events.on("options", _event => _event.preventDefault() & _event.stopPropagation());
	}

	disconnectedCallback () {
		super.disconnectedCallback();
		if (this.tippy) this.tippy.destroy();
	}

	render () {
		const textElement = this.find("#text");
		if (textElement) textElement.remove();

		const iconElement = this.find("#icon");
		if (iconElement) iconElement.remove();

		const templateElement = document.createElement("template");
		this.composition.split(" ").forEach(_type => {
			const value = this[_type];

			switch (_type) {
				case "text": templateElement.innerHTML += `<app-label id="text">${value}</app-label>`; break;
				case "icon": templateElement.innerHTML += `<app-image id="icon" icon="${value}"></app-image>`; break;
			}
		});

		this.append(templateElement.content.cloneNode(true));
	}
}

globalThis.customElements.define("app-button", button);