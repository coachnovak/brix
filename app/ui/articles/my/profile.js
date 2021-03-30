import { component } from "/components/component.js";
import { cover } from "/components/cover.js";
import { avatar } from "/components/avatar.js";

export default {
	options: {
		position: "side"
	},

	templates: () => {
		return {
			style: component.template`
				:host([type]) { padding: 0; }
		
				#layout { display: grid; grid-gap: var(--spacing); }
		
				app-cover { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 80%); }
				app-avatar { position: absolute; left: 50%; top: 210px; transform: translate(-50%, -80%); border: 4px solid var(--paper-1); }
				#display { text-align: center; margin-top: 30px; }
		
				#body { padding: var(--spacing); }
			`,
		
			markup: component.template`
				<div id="head">
					<app-cover size="m"></app-cover>
					<app-avatar size="m"></app-avatar>
					<div id="display">${globalThis.session.identity.firstName} ${globalThis.session.identity.lastName}</div>
				</div>
		
				<div id="body">
					<app-list id="actions"></app-list>
				</div>
			`
		};
	},

	script: async _component => {
		_component.shadow && _component.shadow.events.on("activated", async () => {
			_component.close("closed");
		});

		const actionsElement = _component.find("#actions");

		(await actionsElement.add({
			id: "do-settings",
			contents: [
				{ icon: "cogs" },
				{ text: "Settings" },
				{ arrow: true }
			]
		})).events.on("activated", async _event => {
			globalThis.contents.close();
			globalThis.contents.open({ name: "my/settings/index" });
			_component.close("closed");
		});

		(await actionsElement.add({
			id: "do-signout",
			contents: [
				{ icon: "sign-out" },
				{ text: "Sign out" },
				{ arrow: true }
			]
		})).events.on("activated", async _event => {
			localStorage.removeItem("token");
			localStorage.removeItem("expires");

			globalThis.session.events.emit("signedout");
			_component.close("closed");
		});
	}
};