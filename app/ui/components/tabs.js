import { component } from "/components/component.js";
import { button } from "/components/button.js";

// const tabsElement = _component.find("#views");
// tabsElement.events.on("selected", () => {
// 	globalThis.contents.cut("room/index");
// 	globalThis.contents.open({ name: `room/${tabsElement.selected}`, parameters: { room } });
// });

// tabsElement.add("participants", { icon: "users", composition: "icon", tiptext: "Participants", tipplacement: "bottom" });
// tabsElement.add("toolbox", { icon: "toolbox", composition: "icon", tiptext: "Toolbox", tipplacement: "bottom" });

export class tabs extends component {
	constructor (_properties = {}) {
		super({ ..._properties });

		const { selected } = _properties;
		this.property({ name: "selected", value: selected, options: { default: null } });
    }

	connectedCallback ({ style, markup } = {}) {
		super.conditionsCallback();
		super.connectedCallback({
			style: component.template`
				#buttons > app-button { display: inline-grid; padding: 12px; border-radius: 0; }
				#buttons > app-button.selected { border-bottom-color: var(--paper-3); }

				${style ? style() : ""}
			`,

			markup: component.template`
				<div id="buttons"></div>

				${markup ? markup() : ""}
			`
		});
	}

	disconnectedCallback () {
		super.disconnectedCallback();
	}

	add (_id, _button) {
		const buttonsElement = this.find("#buttons");
		const buttonElement = buttonsElement.appendChild(new button({
			id: `tab_${_id}`,
			size: "large",
			embedded: true,
			..._button
		}));

		buttonElement.events.on("activated", () => this.activate(_id));
		if (this.selected === null) this.activate(_id);
	}

	activate (_id) {
		const oldButtonElement = this.find(`#tab_${this.selected}`);
		if (oldButtonElement) oldButtonElement.classList.remove("selected");

		const newButtonElement = this.find(`#tab_${_id}`);
		newButtonElement.classList.add("selected");

		this.selected = _id;
		this.events.emit("selected");
	}
}

globalThis.customElements.define("app-tabs", tabs);