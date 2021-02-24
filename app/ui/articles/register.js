import { textbox } from "/components/textbox.js";
import { button } from "/components/button.js";

export default {
	styles: `
		#register { display: grid; grid-gap: 20px; width: 100%; grid-template-columns: repeat(auto-fill, 100%); }
		#register-head { grid-column: 1 / -1; }
		#register-buttons { display: grid; grid-gap: 20px; grid-template-columns: repeat(auto-fill, 100%); grid-column: 1 / -1; }
		#register-buttons app-button { width: 100%; }

		@media all and (min-width: 256px) {
			#register-buttons { grid-template-columns: repeat(auto-fill, calc(50% - 10px)); }
		}

		@media all and (min-width: 456px) {
			#register { grid-template-columns: repeat(auto-fill, calc(50% - 10px)); }
			#register-buttons { grid-template-columns: repeat(auto-fill, 25%); }
		}
	`,

	markup: `
		<div id="register">
			<div id="register-head">
				<h2>User registration</h2>
			</div>

			<app-textbox type="textbox" id="register-email" placeholder="Whats your e-mail"></app-textbox>
			<app-textbox type="password" id="register-password" placeholder="Whats your password"></app-textbox>
			<app-textbox type="textbox" id="register-firstname" placeholder="Whats your first name"></app-textbox>
			<app-textbox type="textbox" id="register-lastname" placeholder="Whats your last name"></app-textbox>

			<div id="register-buttons">
				<app-button id="register-continue" text="Register" icon="check" composition="text icon"></app-button>
				<app-button id="register-cancel" text="Cancel" composition="text" embedded="true"></app-button>
			</div>
		</div>
	`,

	script: async _component => {
		const emailElement = _component.use("register-email");
		emailElement.on("ready", () => emailElement.focus());

		const passwordElement = _component.use("register-password");
		const firstnameElement = _component.use("register-firstname");
		const lastnameElement = _component.use("register-lastname");

		_component.shadow.once("activated", async () => {
			_component.close("cancelled");
		});

		_component.use("register-cancel").once("activated", async () => {
			_component.close("cancelled");
		});

		_component.use("register-continue").on("activated", async () => {
			const emailValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(emailElement.value());
			const passwordValid = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/.test(passwordElement.value());
			const firstnameValid = /^[a-zA-Z\u00C0-\u00ff]+$/i.test(firstnameElement.value());
			const lastnameValid = /^[a-zA-Z\u00C0-\u00ff]+$/.test(lastnameElement.value());

			if (!emailValid) return globalThis.notify({ icon: "exclamation-circle", text: "Invalid e-mail provided." });
			if (!passwordValid) return globalThis.notify({ icon: "exclamation-circle", text: "Invalid password provided." });
			if (!firstnameValid) return globalThis.notify({ icon: "exclamation-circle", text: "Invalid first name provided." });
			if (!lastnameValid) return globalThis.notify({ icon: "exclamation-circle", text: "Invalid last name provided." });

			const authResponse = await globalThis.fetcher(`/api/security/register/`, {
				method: "post",
				body: JSON.stringify({
					email: emailElement.value(),
					password: passwordElement.value(),
					firstName: firstnameElement.value(),
					lastName: lastnameElement.value()
				})
			});

			if (authResponse.status === 201) {
				_component.close("registered");

				globalThis.contents.close();
				globalThis.contents.open({
					name: "success",
					parameters: {
						title: "Congratulations!",
						description: "Your account has been created.",
						action: { options: { icon: "sign-in", text: "Sign in", composition: "text icon" }, windows: { name: "signin" } }
					}
				});
			}
		});
	}
};