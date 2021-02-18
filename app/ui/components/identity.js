import { base } from "/components/base.js";

export class identity extends base {
	constructor (_properties = {}) {
		super(Object.assign(_properties ? _properties : {}, {

        }));

		this
			.property("display", _properties.display ? _properties.display : null);

        this.styles.push(`
			:host { position: relative; }
			.container { position: relative; top: 50%; transform: translateY(-50%); overflow: hidden; }
			.container #display { transform: translateY(0%); }
			.container #display:empty { transform: translateY(100%); }
		`);
	}

	async connectedCallback () {
		await super.connectedCallback();

		const containerElement = this.appendChild(document.createElement("div"));
		containerElement.classList.add("container");

		const displayElement = containerElement.appendChild(document.createElement("div"));
		displayElement.id = "display";

		this.refresh();
		this.emit("ready");

		this.on("display updated", _event => {
			const data = _event.detail;
			displayElement.innerHTML = data;
		});
	}

	async refresh () {
		if (localStorage.getItem("token")) {
			const identityResponse = await globalThis.fetcher(`/api/security/identify/`, { method: "get" });
	
			if (identityResponse.status === 200) {
				this.user = await identityResponse.json();
				this.use("display").innerHTML = `${this.user.firstName} ${this.user.lastName}`;
			}
		} else {
			this.use("display").innerHTML = "";
		}
	}
}

globalThis.customElements.define("app-identity", identity);