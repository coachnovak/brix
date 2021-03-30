import events from "/components/events.js";

export default class {
	constructor () {
		this.events = new events();

		Object.defineProperty(this, "identity", { value: null, writable: true });
		Object.defineProperty(this, "signedin", { get () { return this.token !== null && this.expires !== null } });
		Object.defineProperty(this, "token", { get () { return localStorage.getItem("identity.token") } });
		Object.defineProperty(this, "expires", { get () { return localStorage.getItem("identity.expires") } });

		this.events.on("signedin", async (_data) => {
			localStorage.setItem("identity.token", _data.token);
			localStorage.setItem("identity.expires", _data.expires);
		});

		this.events.on("signedout", async () => {
			this.identity = null;
			localStorage.removeItem("identity.token");
			localStorage.removeItem("identity.expires");
		});
	}

	async evaluate () {
		if (this.signedin) {
			const expires = new Date(this.expires);
			const now = new Date();

			// If token expired, emit signed out.
			if (expires < now) this.events.emit("signedout");

			// If token is valid and no identity was found, identify.
			else if (!this.identity) await this.identify();
		}

		// Continuous evaluation of identity validity.
		setTimeout(() => this.evaluate(), 500);

		return this;
	}

	identify () {
		// Ignore if not signed in.
		if (!this.signedin) return this;

		// Signed in, get my identity.
		return new Promise(async (_resolve, _reject) => {
			await globalThis.fetcher(`/api/my/identity/`, {
				method: "get"
			}, {
				200: async _response => {
					this.identity = await _response.json();
					_resolve();
				},
				400: async _response => {
					const { message } = await _response.json();
					globalThis.notify([{ icon: "exclamation-triangle" }, { text: message }]).close(3000);
					_resolve();
				},
				401: async _response => {
					const { message } = await _response.json();
					globalThis.notify([{ icon: "exclamation-triangle" }, { text: message }]).close(3000);
					_resolve();
				}
			});
		});
	}
}