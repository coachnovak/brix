import { textbox } from "/components/textbox.js";
import { button } from "/components/button.js";

export default {
	styles: `
		#signin-forgot-head { margin-bottom: 20px; }
		#signin-forgot-form { display: grid; grid-gap: 20px; grid-template-columns: auto; margin-bottom: 20px; }
		#signin-forgot-primaries { display: grid; grid-gap: 20px; grid-template-columns: auto; }
		#signin-forgot-primaries div app-button,
		#signin-forgot-secondaries div app-button { width: 100%; }
		#signin-forgot-secondaries { text-align: center; }
		#signin-forgot-divider { margin-top: 20px; margin-bottom: 20px; }

		@media all and (min-width: 456px) {
			#signin-forgot-primaries div app-button { width: unset; }
			#signin-forgot-primaries { grid-template-columns: min-content min-content auto; }
			#signin-forgot-primaries div:nth-child(3) { text-align: right; }

			#signin-forgot-secondaries div app-button { width: unset; }
		}

		@media all and (min-width: 456px) {
			#signin-forgot { grid-template-columns: repeat(auto-fill, calc(50% - 10px)); }
		}
	`,

	markup: `
		<div id="signin-forgot">
			<h2 id="signin-forgot-head">Forgotten password</h2>

			<div id="signin-forgot-form">
				<app-textbox type="textbox" id="signin-forgot-email" placeholder="Whats your e-mail"></app-textbox>
			</div>

			<div id="signin-forgot-primaries">
				<div><app-button id="signin-forgot-recover" text="Recover" icon="check" composition="text icon"></app-button></div>
				<div><app-button id="signin-forgot-cancel" text="Cancel" composition="text" embedded="true"></app-button></div>
			</div>
		</div>
	`,

	script: async _component => {
		const emailElement = _component.use("signin-forgot-email");
		emailElement.on("ready", () => emailElement.focus());

		if (_component.shadow) _component.shadow.once("activated", async () => {
			_component.close("cancelled");
		});

		_component.use("signin-forgot-email").on("activated", async () => {
			_component.use("signin-forgot-recover").emit("activated");
		});

		_component.use("signin-forgot-cancel").once("activated", async () => {
			_component.close("cancelled");
		});

		_component.use("signin-forgot-recover").on("activated", async () => {
			const emailValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(emailElement.value());
			if (!emailValid) return globalThis.notify({ text: "Invalid e-mail provided." });

			const authResponse = await globalThis.fetcher(`/api/security/forgot/`, {
				method: "post",
				body: JSON.stringify({
					email: emailElement.value()
				})
			});

			switch (authResponse.status) {
				case 200:
					_component.close("recovery initiated");
					globalThis.notify({ icon: "info-circle", text: "You'll receive a recovery e-mail soon." });

					break;

			}
		});
	}
};