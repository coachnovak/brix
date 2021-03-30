import { component } from "/components/component.js";
import { button } from "/components/button.js";
import { textbox } from "/components/textbox.js";

export default {
	options: {
		position: "center"
	},

	templates: () => {
		return {
			style: component.template`
				:host([type]) { width: var(--size-s); }
		
				#layout { display: grid; grid-gap: 20px; }
				#actions app-button { width: 100%; }
		
				@media (orientation: landscape) {
					#actions app-button { width: unset; position: relative; left: 50%; transform: translateX(-50%); }
				}
			`,
		
			markup: component.template`
				<div id="layout">
					<h2>Rename the room</h2>
		
					<app-textbox id="name" placeholder="Room name"></app-textbox>
		
					<div id="actions">
						<app-button id="save" text="Save" icon="check" composition="text icon"></app-button>
					</div>
				</div>
			`
		};
	},

	script: async _component => {
		_component.shadow.events.on("activated", async () => {
			_component.close("cancelled");
		});

		const nameElement = _component.find("#name");
		const saveElement = _component.find("#save");
		nameElement.events.on("activated", async () => saveElement.events.emit("activated"));
		nameElement.value = _component.parameters.room.name;
		nameElement.focus();

		saveElement.events.on("activated", async () => {
			const nameValid = /^[a-zA-Z0-9 _]{1,20}$/.test(nameElement.value);
			if (!nameValid) return globalThis.notify([{ icon: "exclamation-circle" }, { text: "Invalid name provided." }]).close(3000);

			const renameResponse = await globalThis.fetcher(`/api/room/rename/${_component.parameters.room._id}`, {
				method: "put",
				body: JSON.stringify({
					name: nameElement.value
				})
			});

			const renameContent = await renameResponse.json();

			if (renameResponse.status === 200) {
				globalThis.notify([{ icon: "info-circle" }, { text: "You successfully renamed the room." }]).close(3000);
				_component.close("renamed", renameContent);
			} else if (renameResponse.status >= 400) {
				globalThis.notify([{ icon: "exclamation-circle" }, { text: renameContent.message }]).close(3000);
			}
		});
	}
};