import { component } from "/components/component.js";
import { notification } from "/components/notification.js";

export class notifications extends component {
	constructor (_properties = {}) {
		super({ ..._properties });
    }

	connectedCallback ({ style, markup } = {}) {
		super.connectedCallback({
			style: component.template`
				:host { display: grid; grid-gap: 3px; justify-content: stretch; align-content: start; position: fixed; left: 50%; bottom: 10px; width: calc(100% - 40px); max-width: 400px; transform: translateX(-50%); }

				${style ? style() : ""}
			`,

			markup: component.template`
				${markup ? markup() : ""}
			`
		});

		// Redirect events.
		/* None */

		// Handle events.
		/* None */
	}

	disconnectedCallback () {
		super.disconnectedCallback();
	}

	push (_contents) {
		const newNotification = new notification({ contents: _contents });
		return this.append(newNotification);
	}
}

globalThis.customElements.define("app-notifications", notifications);