import { component } from "/components/component.js";
import { textbox } from "/components/textbox.js";
import { button } from "/components/button.js";

export default {
	templates: () => {
		return {
			style: component.template`
				:host([type]) { width: var(--size-s); }
		
				#layout { display: grid; grid-gap: var(--spacing); }
				#actions app-button { width: 100%; }
		
				@media (orientation: landscape) {
					#actions app-button { width: unset; position: relative; left: 50%; transform: translateX(-50%); }
				}
			`,
		
			markup: component.template`
				<div id="layout">
					<h2>Forgotten password</h2>
		
					<app-textbox id="email" placeholder="Whats your e-mail"></app-textbox>
		
					<div id="actions">
						<app-button id="recover" text="Recover" icon="paper-plane" composition="text icon"></app-button>
					</div>
				</div>
			`
		};
	},

	script: async _component => {
		const emailElement = _component.find("#email");
		emailElement.focus();

		_component.shadow && _component.shadow.events.on("activated", async () => _component.close("cancelled"));
		_component.find("#email").events.on("activated", async () => _component.find("#recover").emit("activated"));

		_component.find("#recover").events.on("activated", async () => {
			const emailValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(emailElement.value);
			if (!emailValid) return globalThis.notify([{ text: "Invalid e-mail provided." }]).close(3000);

			const authResponse = await globalThis.fetcher(`/api/security/forgot/`, {
				method: "post",
				body: JSON.stringify({
					email: emailElement.value
				})
			});

			switch (authResponse.status) {
				case 200:
					_component.close("recovery initiated");
					globalThis.notify([{ icon: "info-circle" }, { text: "You'll receive a recovery e-mail soon." }]).close(3000);

					break;

			}
		});
	}
};