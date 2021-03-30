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
		
				#layouot { display: grid; grid-gap: 20px; }
				#actions app-button { width: 100%; }
		
				@media (orientation: landscape) {
					#actions app-button { width: unset; position: relative; left: 50%; transform: translateX(-50%); }
				}
			`,
		
			markup: component.template`
				<div id="layouot">
					<h2>Create a room</h2>
					<app-textbox id="name" placeholder="Room name"></app-textbox>
					<div id="actions">
						<app-button id="continue" text="Create" icon="check" composition="text icon"></app-button>
					</div>
				</div>
			`
		};
	},

	script: async _component => {
		_component.shadow.events.on("activated", async () => {
			_component.close("cancelled");
		});

		const createNameElement = _component.find("#name");
		const createContinueElement = _component.find("#continue");
		createNameElement.focus();

		createNameElement.events.on("activated", async () => {
			createContinueElement.events.emit("activated");
		});

		createContinueElement.events.on("activated", async () => {
			const nameValid = /^[a-zA-Z0-9 _]{1,40}$/.test(createNameElement.value);
			if (!nameValid) return globalThis.notify([{ icon: "exclamation-circle" }, { text: "Invalid name provided." }]).close(3000);

			const createResponse = await globalThis.fetcher(`/api/room/`, {
				method: "post",
				body: JSON.stringify({
					name: createNameElement.value
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
				globalThis.notify([{ icon: "exclamation-circle" }, { text: createContent.message }]).close(3000);
			}
		});
	}
};