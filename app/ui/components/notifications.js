import { base } from "/components/base.js";
import { notification } from "/components/notification.js";

export class notifications extends base {
	constructor (_properties = {}) {
		super(Object.assign(_properties ? _properties : {}, {

        }));

        this.styles.push(`
			:host { display: grid; grid-gap: 3px; justify-content: stretch; align-content: start; position: absolute; left: 50%; bottom: 10px; width: calc(100% - 40px); max-width: 400px; transform: translateX(-50%); }

			app-notification { text-align: center; overflow: hidden; }

			app-notification .container { background: var(--paper-2); color: var(--pen-2); box-shadow: 0 2px 2px 1px rgba(0, 0, 0, 0.3); overflow: hidden; }
			app-notification .container { display: inline-grid; grid-template-columns: min-content auto; grid-gap: 10px; padding: 10px; align-items: center; border-radius: 3px; }

			app-notification .container { transform: translateY(100%); width: 20px; text-align: left; }
			app-notification .container .text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; visibility: hidden; }
			app-notification .container .icon { font-size: 16px; visibility: hidden; }

			app-notification .container.showcontent .text,
			app-notification .container.showcontent .icon { visibility: unset; }

			app-notification .container.show { animation: 0.2s popup 1 forwards, 0.3s 0.2s spread 1 forwards; }
			app-notification .container.hide { animation: 0.4s popout 1 forwards; }

			@keyframes popup {
				to { transform: translateY(0%); }
			}

			@keyframes spread {
				to { transform: translateY(0%); width: 100%; }
			}

			@keyframes popout {
				from { transform: translateY(0%); width: 100%; }
				to { transform: translateY(150%); width: 100%; }
			}
		`);
	}

	async connectedCallback () {
		await super.connectedCallback();
		await super.readInIcons();

		this.emit("ready");
	}

	push ({ icon, text }) {
		const newNotification = new notification({ icon, text, isolated: false });
		this.appendChild(newNotification);
	}

	focus () {
		this.use("input").focus();
	}
}

globalThis.customElements.define("app-notifications", notifications);