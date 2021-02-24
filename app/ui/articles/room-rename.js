import { button } from "/components/button.js";
import { textbox } from "/components/textbox.js";

export default {
	options: {
		position: "center"
	},

	styles: `
		#room-rename { display: grid; grid-gap: 20px; }
		#room-rename-buttons { display: grid; grid-gap: 20px; grid-template-columns: repeat(auto-fill, 100%); grid-column: 1 / -1; }
		#room-rename-buttons app-button { width: 100%; }

		@media all and (min-width: 256px) {
			#room-rename-buttons { grid-template-columns: repeat(auto-fill, calc(50% - 10px)); }
		}

		@media all and (min-width: 456px) {
			#room-rename-buttons { grid-template-columns: repeat(auto-fill, 25%); }
		}
	`,

	markup: `
		<div id="room-rename">
			<h2>Create a room</h2>
			<app-textbox type="textbox" id="room-rename-name" placeholder="Room name"></app-textbox>
			<div id="room-rename-buttons">
				<app-button id="room-rename-continue" text="Create" icon="check" composition="text icon"></app-button>
				<app-button id="room-rename-cancel" text="Cancel" composition="text" embedded="true"></app-button>
			</div>
		</div>
	`,

	script: async _component => {
		// Close article if user isn't signed in.
		if (!localStorage.getItem("token")) {
			globalThis.notify({ icon: "shield-alt", text: "Insufficient permissions for this article." });
			return _component.close();
		}

		_component.shadow.once("activated", async () => {
			_component.close("cancelled");
		});

		const nameElement = _component.use("room-rename-name");
		const continueElement = _component.use("room-rename-continue");

		nameElement.on("ready", async () => {
			nameElement.value(_component.parameters.room.name);
		});

		nameElement.on("activated", async () => {
			continueElement.emit("activated");
		});

		continueElement.on("activated", async () => {
			const nameValid = /^[a-zA-Z0-9 _]{1,20}$/.test(nameElement.value());
			if (!nameValid) return globalThis.notify({ icon: "exclamation-circle", text: "Invalid name provided." });

			const renameResponse = await globalThis.fetcher(`/api/room/rename/${_component.parameters.room._id}`, {
				method: "put",
				body: JSON.stringify({
					name: nameElement.value()
				})
			});

			const renameContent = await renameResponse.json();

			if (renameResponse.status === 200) {
				globalThis.notify({ icon: "info-circle", text: "You successfully renamed the room." });
				_component.close("renamed", renameContent);
			} else if (renameResponse.status >= 400) {
				globalThis.notify({ icon: "exclamation-circle", text: renameContent.message });
			}
		});

		nameElement.once("ready", () => {
			nameElement.focus();
		});

		_component.use("room-rename-cancel").once("activated", () => {
			_component.close("cancelled");
		});
	}
};