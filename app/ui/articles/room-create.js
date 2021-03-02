import { button } from "/components/button.js";
import { textbox } from "/components/textbox.js";

export default {
	options: {
		position: "center"
	},

	styles: `
		#room-create { display: grid; grid-gap: 20px; }
		#room-create-buttons { display: grid; grid-gap: 20px; grid-template-columns: repeat(auto-fill, 100%); grid-column: 1 / -1; }
		#room-create-buttons app-button { width: 100%; }

		@media all and (min-width: 256px) {
			#room-create-buttons { grid-template-columns: repeat(auto-fill, calc(50% - 10px)); }
		}

		@media all and (min-width: 456px) {
			#room-create-buttons { grid-template-columns: repeat(auto-fill, 25%); }
		}
	`,

	markup: `
		<div id="room-create">
			<h2>Create a room</h2>
			<app-textbox type="textbox" id="room-create-name" placeholder="Room name"></app-textbox>
			<div id="room-create-buttons">
				<app-button id="room-create-continue" text="Create" icon="check" composition="text icon"></app-button>
				<app-button id="room-create-cancel" text="Cancel" composition="text" embedded="true"></app-button>
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

		const createNameElement = _component.use("room-create-name");
		const createContinueElement = _component.use("room-create-continue");

		createNameElement.on("activated", async () => {
			createContinueElement.emit("activated");
		});

		createContinueElement.on("activated", async () => {
			const nameValid = /^[a-zA-Z0-9 _]{1,40}$/.test(createNameElement.value());
			if (!nameValid) return globalThis.notify({ icon: "exclamation-circle", text: "Invalid name provided." });

			const createResponse = await globalThis.fetcher(`/api/room/`, {
				method: "post",
				body: JSON.stringify({
					name: createNameElement.value()
				})
			});

			const createContent = await createResponse.json();

			if (createResponse.status === 201) {
				globalThis.windows.open({
					name: "success",
					parameters: {
						title: "Hurra!",
						description: "Your room has been created.",
						action: { options: { text: "Start collaborating", composition: "text" }, windows: { close: true } }
					}
				});

				_component.close("created", createContent);
			} else if (createResponse.status >= 400) {
				globalThis.notify({ icon: "exclamation-circle", text: createContent.message });
			}
		});

		createNameElement.once("ready", () => {
			createNameElement.focus();
		});

		_component.use("room-create-cancel").once("activated", () => {
			_component.close("cancelled");
		});
	}
};