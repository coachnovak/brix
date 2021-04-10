import { component } from "/components/component.js";

export class label extends component {
	constructor (_properties = {}) {
		super({ ..._properties });

		const { text, header, nowrap, bold, italic, oblique, underline, strikethrough, align, casing, ellipsis } = _properties;
		this.property({ name: "text", value: text, options: { default: this.initial }, getter: () => this.initial, setter: _value => this.initial = _value })
			.property({ name: "header", value: header, options: { default: null, isattribute: true } })
			.property({ name: "nowrap", value: nowrap, options: { default: null, isattribute: true } })
			.property({ name: "bold", value: bold, options: { default: null, isattribute: true } })
			.property({ name: "italic", value: italic, options: { default: null, isattribute: true } })
			.property({ name: "oblique", value: oblique, options: { default: null, isattribute: true } })
			.property({ name: "underline", value: underline, options: { default: null, isattribute: true } })
			.property({ name: "strikethrough", value: strikethrough, options: { default: null, isattribute: true } })
			.property({ name: "align", value: align, options: { default: null, isattribute: true } })
			.property({ name: "casing", value: casing, options: { default: null, isattribute: true } })
			.property({ name: "ellipsis", value: ellipsis, options: { default: null, isattribute: true } });
    }

	connectedCallback ({ style, markup } = {}) {
		super.connectedCallback({
			style: component.template`
				:host([header]) { font-weight: 300; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
				:host([header="small"]) { font-size: var(--header-small, 1.2em); }
				:host([header="medium"]) { font-size: var(--header-medium, 1.5em); }
				:host([header="large"]) { font-size: var(--header-large, 1.8em); }
				:host([header="huge"]) { font-size: var(--header-huge, 3.2em); }

				:host([nowrap="true"]) { overflow: hidden; text-overflow: ellipsis; white-space: nowrap;  }
				:host([bold="true"]) { font-style: normal; font-weight: 700; }
				:host([italic="true"]) { font-style: italic; }
				:host([oblique="true"]) { font-style: oblique; }
				:host([underline="true"]) { text-decoration: underline; }
				:host([strikethrough="true"]) { text-decoration: line-through; }

				:host([align="left"]) { text-align: left; }
				:host([align="center"]) { text-align: center; }
				:host([align="right"]) { text-align: right; }
				:host([align="justify"]) { text-align: justify; }

				:host([casing="upper"]) { text-transform: uppercase; }
				:host([casing="lower"]) { text-transform: lowercase; }

				:host([ellipsis="true"]) { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
				:host([ellipsis="false"]) { text-overflow: clip; }

				${style ? style() : ""}
			`,

			markup: component.template`
				<span>${this.initial}</span>

				${markup ? markup() : ""}
			`
		});

		// Initial render.
		this.render();

		// Redirect events.
		/* None. */

		// Handle events.
		this.events.on("text updated", _value => this.render());
	}

	disconnectedCallback () {
		super.disconnectedCallback();
	}

	render () {
		if (typeof this.text === "string") {
			// Strings are used as-is.
			this.find("span").innerHTML = this.text;
		} else if (typeof this.text === "number") {
			// Numbers are used as-is.
			this.find("span").innerHTML = this.text;
		} else if (this.text && typeof this.text === "object") {
			// Objects are rendered by localize.
			if (this.text.static) {
				// Static passes rendering.
				// this.html(await globalThis.localize.render({
				// 	static: this.text.static,
				// 	dictionary: this.text?.dictionary ?? {}
				// }));
			} else if (this.text.uid) {
				// Unique id enables localization based on element traversion.
				// this.html(await globalThis.localize.render({
				// 	uid: this.uid,
				// 	dictionary: this.text?.dictionary ?? {},
				// 	default: this.text?.default ?? null
				// }));
			}
		} else {
			// Empty content clears.
			this.find("span").innerHTML = "";
		}
	}
}

globalThis.customElements.define("app-label", label);