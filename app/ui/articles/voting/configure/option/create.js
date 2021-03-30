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
					<h2>Create a new option</h2>
		
					<app-textbox id="icon" placeholder="Name your icon to use"></app-textbox>
					<app-textbox id="label" placeholder="Label your option"></app-textbox>
		
					<div id="actions">
						<app-button id="create" text="Create" icon="check" composition="text icon"></app-button>
					</div>
				</div>
			`
		};
	},

	script: async _component => {
		_component.shadow && _component.shadow.events.on("activated", async () => {
			_component.close("cancelled");
		});

		const iconElement = _component.find("#icon");
		iconElement.events.on("activated", () => labelElement.focus());
		iconElement.value = "vote-yea";
		iconElement.focus();

		const labelElement = _component.find("#label");
		labelElement.events.on("activated", () => _component.find("#create").events.emit("activated"));

		_component.find("#create").events.on("activated", async () => {
			const iconValid = /^[a-z-]+$/.test(iconElement.value);
			if (!iconValid) return globalThis.notify([{ text: "Invalid icon provided." }]).close(3000);

			const labelValid = /^[a-zA-Z0-9 ]+$/.test(labelElement.value);
			if (!labelValid) return globalThis.notify([{ text: "Invalid label provided." }]).close(3000);

			const createResponse = await globalThis.fetcher(`/api/voting/template/${_component.parameters.template._id}/option/`, {
				method: "post",
				body: JSON.stringify({
					icon: iconElement.value,
					label: labelElement.value
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