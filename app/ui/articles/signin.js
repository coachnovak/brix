import { textbox } from "/components/textbox.js";
import { button } from "/components/button.js";

export default {
	styles: `
		#signin-head { margin-bottom: 20px; }
		#signin-form { display: grid; grid-gap: 20px; grid-template-columns: auto; margin-bottom: 20px; }
		#signin-primaries { display: grid; grid-gap: 20px; grid-template-columns: auto; }
		#signin-primaries div app-button,
		#signin-secondaries div app-button { width: 100%; }
		#signin-secondaries { text-align: center; }
		#signin-divider { margin-top: 20px; margin-bottom: 20px; }

		@media all and (min-width: 456px) {
			#signin-primaries div app-button { width: unset; }
			#signin-primaries { grid-template-columns: min-content min-content auto; }
			#signin-primaries div:nth-child(3) { text-align: right; }

			#signin-secondaries div app-button { width: unset; }
		}

		@media all and (min-width: 456px) {
			#signin { grid-template-columns: repeat(auto-fill, calc(50% - 10px)); }
		}
	`,

	markup: `
		<div id="signin">
			<h2 id="signin-head">Sign in</h2>

			<div id="signin-form">
				<app-textbox type="textbox" id="signin-email" placeholder="Whats your e-mail"></app-textbox>
				<app-textbox type="password" id="signin-password" placeholder="Whats your password"></app-textbox>
			</div>

			<div id="signin-primaries">
				<div><app-button id="signin-continue" text="Sign in" icon="check" composition="text icon"></app-button></div>
				<div><app-button id="signin-cancel" text="Cancel" composition="text" embedded="true"></app-button></div>
				<div><app-button id="signin-forgot" text="Forgot password" composition="text" secondary="true"></app-button></div>
			</div>

			<div id="signin-divider" class="divider"><span>or</span></div>

			<div id="signin-secondaries">
				<div><app-button id="signin-register" text="Create an account" composition="text"></app-button></div>
			</div>
		</div>
	`,

	script: async _component => {
		const emailElement = _component.use("signin-email");
		emailElement.autocomplete = "name";
		emailElement.on("ready", () => emailElement.focus());

		const passwordElement = _component.use("signin-password");
		passwordElement.autocomplete = "current-password";

		if (_component.shadow) _component.shadow.once("activated", async () => {
			_component.close("cancelled");
		});

		_component.use("signin-email").on("activated", async () => {
			_component.use("signin-password").focus();
		});

		_component.use("signin-password").on("activated", async () => {
			_component.use("signin-continue").emit("activated");
		});

		_component.use("signin-cancel").once("activated", async () => {
			_component.close("cancelled");
		});

		_component.use("signin-forgot").on("activated", async () => {
			globalThis.windows.open({ name: "signin-forgot" });
		});

		_component.use("signin-register").on("activated", async () => {
			_component.use("signin-cancel").emit("activated");
			globalThis.windows.open({ name: "register" });
		});

		_component.use("signin-continue").on("activated", async () => {
			const emailValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(emailElement.value());
			const passwordValid = passwordElement.value() !== "";
			
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

					_component.close("signed in");

					globalThis.contents.close();
					globalThis.contents.open({ name: "rooms" });

					break;

				case 401:
					globalThis.notify({ text: "Failed to authenticate with the provided credentials." });
					break;

			}			
		});
	}
};