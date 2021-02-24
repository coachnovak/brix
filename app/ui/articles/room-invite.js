import { button } from "/components/button.js";
import { textbox } from "/components/textbox.js";

export default {
	options: {
		position: "center"
	},

	styles: `
		#room-invite { display: grid; grid-gap: 20px; }
		#room-invite-buttons { display: grid; grid-gap: 20px; grid-template-columns: repeat(auto-fill, 100%); grid-column: 1 / -1; }
		#room-invite-buttons app-button { width: 100%; }

		@media all and (min-width: 256px) {
			#room-invite-buttons { grid-template-columns: repeat(auto-fill, calc(50% - 10px)); }
		}

		@media all and (min-width: 456px) {
			#room-invite-buttons { grid-template-columns: repeat(auto-fill, 25%); }
		}
	`,

	markup: `
		<div id="room-invite">
			<h2>Invite someone</h2>
			<app-textbox type="textbox" id="room-invite-email" placeholder="E-mail address"></app-textbox>
			<div id="room-invite-buttons">
				<app-button id="room-invite-continue" text="Invite" icon="share" composition="text icon"></app-button>
				<app-button id="room-invite-cancel" text="Cancel" composition="text" embedded="true"></app-button>
			</div>
		</div>
	`,

	script: async _component => {
		// Close article if user isn't signed in.
		if (!localStorage.getItem("token")) return _component.close();

		_component.shadow.once("activated", async () => {
			_component.close("cancelled");
		});

		const inviteEmailElement = _component.use("room-invite-email");
		const inviteContinueElement = _component.use("room-invite-continue");

		inviteEmailElement.on("activated", async () => {
			inviteContinueElement.emit("activated");
		});

		inviteContinueElement.on("activated", async () => {
			const emailValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(inviteEmailElement.value());
			if (!emailValid) return globalThis.notify({ icon: "exclamation-circle", text: "Invalid e-mail provided." });

			const inviteResponse = await globalThis.fetcher(`/api/room/invites/${_component.parameters.room._id}`, {
				method: "post",
				body: JSON.stringify({
					email: inviteEmailElement.value() /*,
					ttl: 30*/
				})
			});

			const inviteContent = await inviteResponse.json();

			if (inviteResponse.status === 201) {
				_component.close("registered");

				globalThis.windows.open({
					name: "success",
					parameters: {
						title: "Great!",
						description: "Your invite has been sent.",
						action: { options: { text: "Keep collaborating", composition: "text" }, windows: { close: true } }
					}
				});
			} else if (inviteResponse.status >= 400) {
				globalThis.notify({ icon: "exclamation-circle", text: inviteContent.message });
			}
		});

		inviteEmailElement.once("ready", () => {
			inviteEmailElement.focus();
		});

		_component.use("room-invite-cancel").once("activated", () => {
			_component.close("cancelled");
		});
	}
};