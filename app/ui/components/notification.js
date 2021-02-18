import { base } from "/components/base.js";

export class notification extends base {
	constructor (_properties = {}) {
		super(Object.assign(_properties, {

		}));

		this
			.property("icon", _properties.icon ? _properties.icon : null)
			.property("text", _properties.text ? _properties.text : null);
	}

	async connectedCallback () {
		await super.connectedCallback();

		const containerElement = this.appendChild(document.createElement("div"));
		containerElement.classList.add("container");
		this.timerShowNotification = setTimeout(() => containerElement.classList.add("show"), 25);
		this.timerShowContent = setTimeout(() => containerElement.classList.add("showcontent"), 500);

		const iconElement = containerElement.appendChild(document.createElement("div"));
		iconElement.classList.add("icon");
		iconElement.innerHTML = `<i class="fad fa-${this.icon}"></i>`;

		const textElement = containerElement.appendChild(document.createElement("div"));
		textElement.classList.add("text");
		textElement.innerHTML = this.text;

		const hideTime = this.text.length * 100;
		this.timerHide = setTimeout(() => containerElement.classList.add("hide"), hideTime);
		this.timerRemove = setTimeout(() => this.remove(), hideTime + 400);
		this.emit("ready");
	}

	async disconnectedCallback () {
		clearTimeout(this.timerShowNotification);
		clearTimeout(this.timerHide);
		clearTimeout(this.timerRemove);
	}
}

globalThis.customElements.define("app-notification", notification);