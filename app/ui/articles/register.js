import { textbox } from "/components/textbox.js";
import { button } from "/components/button.js";

export default {
	styles: `
		#register { display: grid; grid-gap: 20px; width: 100%; grid-template-columns: repeat(auto-fill, 100%); }
		#register-head { grid-column: 1 / -1; text-align: center; margin-bottom: 10px; }
		#register-image { grid-column: 1 / -1; text-align: center; margin-bottom: 10px; }
		#register-buttons { display: grid; grid-gap: 20px; grid-template-columns: repeat(auto-fill, 100%); grid-column: 1 / -1; }
		#register-buttons app-button { width: 100%; }

		@media all and (min-width: 256px) {
			#register img { width: 80%; }
			#register-buttons { grid-template-columns: repeat(auto-fill, calc(50% - 10px)); }
		}

		@media all and (min-width: 456px) {
			#register img { width: 50%; }
			#register { grid-template-columns: repeat(auto-fill, calc(50% - 10px)); }
			#register-buttons { grid-template-columns: repeat(auto-fill, 25%); }
		}

		meter { appearance: none; margin: 3px 0 10px 0; width: 100%; height: 3px; background: none; background-color: var(--paper-3); }
		meter::-webkit-meter-bar { background: none; background-color: var(--paper-3); }

		#password-strength-text:empty { display: none; }

		meter[value="1"] { background: red; }
		meter[value="2"] { background: yellow; }
		meter[value="3"] { background: orange; }
		meter[value="4"] { background: green; }
		
		meter[value="1"]::-moz-meter-bar { background: red; }
		meter[value="2"]::-moz-meter-bar { background: yellow; }
		meter[value="3"]::-moz-meter-bar { background: orange; }
		meter[value="4"]::-moz-meter-bar { background: green; }
	`,

	markup: `
		<div id="register">
			<div id="register-head">
				<h2>User registration</h2>
			</div>

			<div id="register-image">
				<img src="/assets/register.svg" />
			</div>

			<app-textbox type="textbox" id="register-email" placeholder="Whats your e-mail"></app-textbox>

			<div id="register-password-hint">
				<app-textbox type="password" id="register-password" placeholder="Whats your password"></app-textbox>
				<meter max="4" id="password-strength-meter"></meter>
				<div id="password-strength-text"></div>
			</div>

			<app-textbox type="textbox" id="register-firstname" placeholder="Whats your first name"></app-textbox>
			<app-textbox type="textbox" id="register-lastname" placeholder="Whats your last name"></app-textbox>

			<div id="register-buttons">
				<app-button id="register-continue" text="Register" icon="check" composition="text icon"></app-button>
				<app-button id="register-cancel" text="Cancel" composition="text" embedded="true"></app-button>
			</div>
		</div>
	`,

	script: async _component => {
		const strength = {
			0: "A strong password is needed.",
			1: "The password is dead simple, you can't use it.",
			2: "The password is very weak, you can't use it.",
			3: "The password is weak, you can't use it.",
			4: "The password is okay, you can use but its not recommended.",
			5: "The password is great!"
		}

		const emailElement = _component.use("register-email");
		emailElement.on("ready", () => emailElement.focus());

		const passwordStrengthTextElement = _component.use("password-strength-text");
		const passwordStrengthMeterElement = _component.use("password-strength-meter");
		const passwordElement = _component.use("register-password");
		passwordElement.on("changed", () => {
			let value = passwordElement.value();
			let result = zxcvbn(value);
			passwordStrengthMeterElement.value = result.score;

			if (value !== "")
				passwordStrengthTextElement.innerHTML = strength[result.score + 1] + ` <span class="feedback">${result.feedback.suggestions}</span>`; 
			else
				passwordStrengthTextElement.innerHTML = strength[0];
		});

		const firstnameElement = _component.use("register-firstname");
		const lastnameElement = _component.use("register-lastname");

		_component.shadow.once("activated", async () => {
			_component.close("cancelled");
		});

		emailElement.on("activated", async () => passwordElement.focus());
		passwordElement.on("activated", async () => firstnameElement.focus());
		firstnameElement.on("activated", async () => lastnameElement.focus());
		lastnameElement.on("activated", async () => _component.use("register-continue").emit("activated"));

		_component.use("register-cancel").once("activated", async () => {
			_component.close("cancelled");
		});

		_component.use("register-continue").on("activated", async () => {
			let passwordValue = passwordElement.value();
			let passwordStrength = zxcvbn(passwordValue);

			const emailValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(emailElement.value());
			const firstnameValid = /^[a-zA-Z\u00C0-\u00ff]+$/i.test(firstnameElement.value());
			const lastnameValid = /^[a-zA-Z\u00C0-\u00ff]+$/.test(lastnameElement.value());

			if (!emailValid) return globalThis.notify({ icon: "exclamation-circle", text: "Invalid e-mail provided." });
			if (passwordStrength.score < 3) return globalThis.notify({ icon: "exclamation-circle", text: "Invalid password provided." });
			if (!firstnameValid) return globalThis.notify({ icon: "exclamation-circle", text: "Invalid first name provided." });
			if (!lastnameValid) return globalThis.notify({ icon: "exclamation-circle", text: "Invalid last name provided." });

			const registerResponse = await globalThis.fetcher(`/api/security/register/`, {
				method: "post",
				body: JSON.stringify({
					email: emailElement.value(),
					password: passwordElement.value(),
					firstName: firstnameElement.value(),
					lastName: lastnameElement.value()
				})
			});

			const registerContent = await registerResponse.json();

			if (registerResponse.status === 201) {
				_component.close("registered");

				globalThis.windows.open({
					name: "success",
					parameters: {
						title: "Congratulations!",
						description: "Your account has been created.",
						action: { options: { icon: "sign-in", text: "Sign in", composition: "text icon" }, windows: { name: "signin" } }
					}
				});
			} else {
				globalThis.notify({ icon: "exclamation-circle", text: registerContent.message });
			}
		});
	}
};