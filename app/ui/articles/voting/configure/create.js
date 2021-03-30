import { component } from "/components/component.js";
import { textbox } from "/components/textbox.js";
import { button } from "/components/button.js";

export default {
	templates: () => {
		return {
			style: component.template`
				:host([type]) { width: var(--size-s); }
		
				#layout { display: grid; grid-gap: var(--spacing); }
				#actions app-button { width: 100%; }
		
				@media (orientation: landscape) {
					#actions app-button { width: unset; position: relative; left: 50%; transform: translateX(-50%); }
				}
			`,
		
			markup: component.template`
				<div id="layout">
					<h2>Create a new template</h2>
		
					<app-textbox id="name" placeholder="Name your template"></app-textbox>
					<app-textbox id="expires" placeholder="Limit voting session in seconds"></app-textbox>
		
					<div id="actions">
						<app-button id="create" text="Create" icon="check" composition="text icon"></app-button>
					</div>
				</div>
			`
		};
	},

	script: async _component => {
		const nameElement = _component.find("#name");
		const expiresElement = _component.find("#expires");
		nameElement.focus();

		_component.shadow && _component.shadow.events.on("activated", async () => _component.close("cancelled"));
		_component.find("#name").events.on("activated", async () => _component.find("#expires").focus());
		_component.find("#expires").events.on("activated", async () => _component.find("#create").events.emit("activated"));

		_component.find("#create").events.on("activated", async () => {
			const nameValid = /^[a-zA-Z0-9 ]+$/.test(nameElement.value);
			if (!nameValid) return globalThis.notify([{ text: "Invalid name provided." }]).close(3000);

			const expiresValid = /^[0-9]+$/.test(expiresElement.value);
			if (!expiresValid && expiresElement.value !== "") return globalThis.notify([{ text: "Invalid expires provided." }]).close(3000);

			const createResponse = await globalThis.fetcher(`/api/voting/template/${_component.parameters.room._id}`, {
				method: "post",
				body: JSON.stringify({
					name: nameElement.value,
					expires: expiresElement.value === "" ? null : parseInt(expiresElement.value)
				})
			});

			switch (createResponse.status) {
				case 201:
					_component.close("created");
					break;

			}
		});
	}
};