import { component } from "/components/component.js";
import { textbox } from "/components/textbox.js";
import { password } from "/components/password.js";
import { button } from "/components/button.js";
import { link } from "/components/link.js";

export default {
	templates: () => {
		return {
			style: component.template`
				:host([type]) { width: var(--size-s); }
		
				#layout { display: grid; grid-template-rows: auto; grid-gap: var(--spacing); }
				#form { display: grid; grid-gap: var(--spacing); grid-template-columns: auto; }
		
				#primaries,
				#secondaries { text-align: center; }
			`,
		
			markup: component.template`
				<div id="layout">
					<div id="head">
						<h2>Sign in</h2>
						<br />
						Let's log you in to your account so you can start collaborating.
					</div>
		
					<div id="form">
						<app-textbox id="email" placeholder="Whats your e-mail" autocomplete="email"></app-textbox>
						<app-password id="password" placeholder="Whats your password" autocomplete="current-password"></app-password>
						<app-link id="forgot" text="Did you forget your password?"></link>
					</div>
		
					<div id="primaries">
						<app-button id="continue" text="Sign in to your account" icon="check" composition="text icon"></app-button>
					</div>
		
					<div id="divider" class="divider"><span>or</span></div>
		
					<div id="secondaries">
						<div><app-button id="register" text="Create a new account" composition="text" secondary="true"></app-button></div>
					</div>
				</div>
			`
		};
	},

	script: async _component => {
		const emailElement = _component.find("#email");
		const passwordElement = _component.find("#password");
		emailElement.focus();

		_component.shadow && _component.shadow.events.on("activated", async () => {
			_component.close("cancelled");
		});

		_component.find("#email").events.on("activated", async () => _component.find("#password").focus());
		_component.find("#password").events.on("activated", async () => _component.find("#continue").emit("activated"));

		_component.find("#forgot").events.on("activated", async () => globalThis.windows.open({ name: "signin-forgot" }));
		_component.find("#register").events.on("activated", async () => globalThis.windows.open({ name: "register" }));

		_component.find("#continue").events.on("activated", async () => {
			const emailValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(emailElement.value);
			const passwordValid = passwordElement.value !== "";

			if (!emailValid) return globalThis.notify([{ text: "Invalid e-mail provided." }]).close(3000);
			if (!passwordValid) return globalThis.notify([{ text: "Invalid password provided." }]).close(3000);

			await globalThis.fetcher(`/api/security/authenticate/`, {
				method: "post",
				body: JSON.stringify({
					email: emailElement.value,
					password: passwordElement.value
				})
			}, {
				201: async (_response) => {
					const session = await _response.json();
					globalThis.session.events.emit("signedin", session);
					_component.close("signedin");

					globalThis.contents.close();
					globalThis.contents.open({ name: "rooms" });
				},
				401: async (_response) => {
					globalThis.notify([{ text: "Failed to authenticate with the provided credentials." }]).close(3000);
				}
			});
		});
	}
};