import { textbox } from "/components/textbox.js";
import { button } from "/components/button.js";

export default {
	styles: `
		.register.container { display: grid; grid-gap: 20px; width: 100%; grid-template-columns: repeat(auto-fill, 100%); }
		.register.container .head { grid-column: 1 / -1; }
		.register.container .buttons { display: grid; grid-gap: 20px; grid-template-columns: repeat(auto-fill, 100%); grid-column: 1 / -1; }

		@media all and (min-width: 256px) {
			.register.container .buttons { grid-template-columns: repeat(auto-fill, 50%); }
		}

		@media all and (min-width: 456px) {
			.register.container { grid-template-columns: repeat(auto-fill, calc(50% - 10px)); }
			.register.container .buttons { grid-template-columns: repeat(auto-fill, 25%); }
		}
	`,

	markup: `
		<div class="register container">
			<div class="head">
				<h2>User registration</h2>
			</div>

			<app-textbox type="textbox" id="register.email" placeholder="Whats your e-mail"></app-textbox>
			<app-textbox type="password" id="register.password" placeholder="Whats your password"></app-textbox>
			<app-textbox type="textbox" id="register.firstname" placeholder="Whats your first name"></app-textbox>
			<app-textbox type="textbox" id="register.lastname" placeholder="Whats your last name"></app-textbox>

			<div class="buttons">
				<app-button id="register.continue" text="Register" icon="check" composition="text icon"></app-button>
			</div>
		</div>
	`,

	script: async _component => {
		const emailElement = _component.use("register.email");
		emailElement.on("ready", () => emailElement.focus());

		const passwordElement = _component.use("register.password");
		const firstnameElement = _component.use("register.firstname");
		const lastnameElement = _component.use("register.lastname");

		_component.use("register.continue").on("activated", async () => {
			const emailValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(emailElement.value());
			const passwordValid = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/.test(passwordElement.value());
			const firstnameValid = /^[a-zA-Z\u00C0-\u00ff]+$/i.test(firstnameElement.value());
			const lastnameValid = /^[a-zA-Z\u00C0-\u00ff]+$/.test(lastnameElement.value());

			if (!emailValid) return;
			if (!passwordValid) return;
			if (!firstnameValid) return;
			if (!lastnameValid) return;

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
				globalThis.article.open([{
					name: "success",
					parameters: {
						title: "Congratulations!",
						description: "Your account has been created.",
						action: { options: { icon: "sign-in", text: "Sign in", composition: "text icon" }, article: { name: "signin" } }
					}
				}], {
					reset: true
				});
			}
		});
	}
};