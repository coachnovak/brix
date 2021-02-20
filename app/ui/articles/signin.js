import { textbox } from "/components/textbox.js";
import { button } from "/components/button.js";

export default {
	styles: `
		.signin.container { display: block; width: 100%; }
		.signin.container .head { margin-bottom: 20px; }
		.signin.container .form { display: grid; grid-gap: 20px; grid-template-columns: auto; margin-bottom: 20px; }
		.signin.container .buttons { display: grid; grid-gap: 20px; grid-template-columns: auto; }
		.signin.container .buttons div app-button { width: 100%; }
		.signin.container .buttons div:first-child { order: 1; }
		.signin.container .buttons div:last-child { order: 2; }

		@media all and (min-width: 356px) {
			.signin.container .buttons div app-button { width: unset; }
			.signin.container .buttons div:first-child { order: 2; }
			.signin.container .buttons div:last-child { order: 1; }
			.signin.container .buttons { grid-template-columns: auto min-content; }
		}

		@media all and (min-width: 456px) {
			.signin.container .form { width: 60%; }
			.signin.container { grid-template-columns: repeat(auto-fill, calc(50% - 10px)); }
		}
	`,

	markup: `
		<div class="signin container">
			<div class="head">
				<h2>Provide your credentials</h2>
				<br />
				Hello there! If you don't have an account already, you can select 'Register' in order to create one.
			</div>

			<div class="form">
				<app-textbox type="textbox" id="signin.email" placeholder="Whats your e-mail"></app-textbox>
				<app-textbox type="password" id="signin.password" placeholder="Whats your password"></app-textbox>
			</div>

			<div class="buttons">
				<div><app-button id="signin.register" text="Create a new account" composition="text" secondary="true"></app-button></div>
				<div><app-button id="signin.continue" text="Sign in" icon="check" composition="text icon"></app-button></div>
			</div>
		</div>
	`,

	script: async _component => {
		const emailElement = _component.use("signin.email");
		emailElement.on("ready", () => emailElement.focus());

		const passwordElement = _component.use("signin.password");

		_component.use("signin.register").on("activated", async () => {
			globalThis.article.open([{ name: "register" }], { reset: true });
		});

		_component.use("signin.email").on("activated", async () => {
			_component.use("signin.password").focus();
		});

		_component.use("signin.password").on("activated", async () => {
			_component.use("signin.continue").emit("activated");
		});

		_component.use("signin.continue").on("activated", async () => {
			const emailValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(emailElement.value());
			const passwordValid = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/.test(passwordElement.value());
			
			if (!emailValid) return globalThis.notify({ text: "Invalid e-mail provided." });
			if (!passwordValid) return globalThis.notify({ text: "Invalid password provided." });

			const authResponse = await globalThis.fetcher(`/api/security/authenticate/`, {
				method: "post",
				body: JSON.stringify({
					email: emailElement.value(),
					password: passwordElement.value()
				})
			});

			switch (authResponse.status) {
				case 201:
					const authDetails = await authResponse.json();
					localStorage.setItem("token", authDetails.token);
					localStorage.setItem("expires", authDetails.expires);
					globalThis.emit("security.signedin");

					document.getElementById("button.signin").visible = false;
					document.getElementById("button.signout").visible = true;
					document.getElementById("identity").refresh();

					globalThis.article.open([{ name: "rooms" }], { reset: true });

					break;

				case 401:
					globalThis.notify({ text: "Failed to authenticate with the provided credentials." });
					break;

			}			
		});
	}
};