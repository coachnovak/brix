import { component } from "/components/component.js";
import { button } from "/components/button.js";
import { textbox } from "/components/textbox.js";

export default {
	options: {
		position: "center"
	},

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
					<h2>Invite someone</h2>
		
					<app-textbox id="email" placeholder="E-mail address"></app-textbox>
		
					<div id="actions">
						<app-button id="continue" text="Invite" icon="share" composition="text icon"></app-button>
					</div>
				</div>
			`
		};
	},

	script: async _component => {
		_component.shadow && _component.shadow.events.on("activated", async () => {
			_component.close("cancelled");
		});

		const inviteEmailElement = _component.find("#email");
		const inviteContinueElement = _component.find("#continue");
		inviteEmailElement.events.on("activated", async () => inviteContinueElement.events.emit("activated"));
		inviteEmailElement.focus();

		inviteContinueElement.events.on("activated", async () => {
			const emailValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(inviteEmailElement.value);
			if (!emailValid) return globalThis.notify([{ icon: "exclamation-circle" }, { text: "Invalid e-mail provided." }]).close(3000);

			await globalThis.fetcher(`/api/room/invites/${_component.parameters.room._id}`, {
				method: "post",
				body: JSON.stringify({
					email: inviteEmailElement.value /*,
					ttl: 30*/
				})
			}, {
				201: _response => {
					_component.close("invited");

					globalThis.windows.open({
						name: "success",
						parameters: {
							title: "Great!",
							description: "Your invite has been sent.",
							action: { options: { text: "Keep collaborating", composition: "text" }, windows: { close: true } }
						}
					});
				}
			});
		});
	}
};