import { component } from "/components/component.js";
import { textbox } from "/components/textbox.js";
import { password } from "/components/password.js";
import { button } from "/components/button.js";

export default {
	templates: () => {
		return {
			style: component.template`
				:host([type]) { width: var(--size-m); padding: 0; }
		
				#layout { display: grid; grid-template-columns: min-content auto; }
		
				#billboard { position: relative; background: var(--paper-3); width: 220px; }
				#billboard i { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); font-size: 48px; }
		
				#form { display: grid; grid-gap: var(--spacing); grid-template-columns: repeat(auto-fill, 100%); padding: calc(var(--spacing) * 3); }
				#form #head { grid-column: 1 / -1; }
		
				#form #password-hint { grid-column: 1 / -1; }
				#form #password-strength-text:empty { display: none; }
		
				#form #buttons { grid-column: 1 / -1; }
				#form #buttons #continue { position: relative; left: 50%; transform: translateX(-50%); }
		
				@media (orientation: portrait) {
					#layout { display: grid; grid-template-columns: auto; }
					#billboard { display: none; }
				}
		
				@media (orientation: landscape) and (min-width: 600px) {
					#form { grid-template-columns: repeat(auto-fill, calc(50% - 10px)); }
				}
			`,
		
			markup: component.template`
				<div id="layout">
					<div id="billboard">
						<i class="fad fa-sparkles"></i>
					</div>
		
					<div id="form">
						<div id="head">
							<h2>Register</h2>
							<br />
							Let's get you all set up so you can verify your personal account and begin setting up your profile.
						</div>
		
						<app-textbox id="firstname" placeholder="Whats your first name" autocomplete="given-name"></app-textbox>
						<app-textbox id="lastname" placeholder="Whats your last name" autocomplete="family-name"></app-textbox>
						<app-textbox id="email" placeholder="Whats your e-mail" autocomplete="email"></app-textbox>
						<app-password id="password" placeholder="Whats your password" autocomplete="new-password"></app-password>
		
						<div id="password-hint">
							<div id="password-strength-text"></div>
						</div>
		
						<div id="buttons"><app-button id="continue" text="Register" icon="check" composition="text icon"></app-button></div>
					</div>
				</div>
			`
		};
	},

	script: async _component => {
		const strength = {
			0: "A strong password is needed.",
			1: "The password is dead simple, you can't use it.",
			2: "The password is very weak, you can't use it.",
			3: "The password is weak, you can't use it.",
			4: "The password is okay, you can use but its not recommended.",
			5: "The password is great!"
		}

		const emailElement = _component.find("#email");
		emailElement.focus();

		const passwordStrengthTextElement = _component.find("#password-strength-text");
		const passwordElement = _component.find("#password");
		passwordElement.events.on("changed", () => {
			const value = passwordElement.value
			const result = passwordElement.evaluate();
			passwordStrengthTextElement.innerHTML = value !== "" ? strength[result.score + 1] : strength[0];
		});

		const firstnameElement = _component.find("#firstname");
		const lastnameElement = _component.find("#lastname");

		_component.shadow.events.on("activated", async () => {
			_component.close("cancelled");
		});

		emailElement.events.on("activated", async () => passwordElement.focus());
		passwordElement.events.on("activated", async () => firstnameElement.focus());
		firstnameElement.events.on("activated", async () => lastnameElement.focus());
		lastnameElement.events.on("activated", async () => _component.find("#continue").emit("activated"));

		_component.find("#continue").events.on("activated", async () => {
			const passwordResult = passwordElement.evaluate();

			const emailValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(emailElement.value);
			const firstnameValid = /^[a-zA-Z\u00C0-\u00ff]+$/i.test(firstnameElement.value);
			const lastnameValid = /^[a-zA-Z\u00C0-\u00ff]+$/.test(lastnameElement.value);

			if (!emailValid) return globalThis.notify([{ icon: "exclamation-circle" }, { text: "Invalid e-mail provided." }]).close(3000);
			if (passwordResult.score < 3) return globalThis.notify([{ icon: "exclamation-circle" }, { text: "Invalid password provided." }]).close(3000);
			if (!firstnameValid) return globalThis.notify([{ icon: "exclamation-circle" }, { text: "Invalid first name provided." }]).close(3000);
			if (!lastnameValid) return globalThis.notify([{ icon: "exclamation-circle" }, { text: "Invalid last name provided." }]).close(3000);

			const registerResponse = await globalThis.fetcher(`/api/security/register/`, {
				method: "post",
				body: JSON.stringify({
					email: emailElement.value,
					password: passwordElement.value,
					firstName: firstnameElement.value,
					lastName: lastnameElement.value
				})
			});

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
			}
		});
	}
};