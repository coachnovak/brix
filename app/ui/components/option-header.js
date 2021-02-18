import { base } from "/components/base.js";

export class optionHeader extends base {
	constructor (_properties = {}) {
		super(Object.assign(_properties ? _properties : {}, {

		}));
		
		this
			.property("text", _properties.text ? _properties.text : null);

		this.styles.push(`
			:host { font-size: 13pt; }
		`);
	}

	async connectedCallback () {
		await super.connectedCallback();
		this.append(this.text);
		this.readInIcons();
	}

	readInIcons () {
		const style = document.getElementById("fa-main");

		if (style) {
			this.append(`
				<style media="all" id="fa-main">${style.innerHTML}</style>
			`);
		} else {
			setTimeout(() => { this.readInIcons(); }, 10);
		}
	}
}

globalThis.customElements.define("app-option-header", optionHeader);