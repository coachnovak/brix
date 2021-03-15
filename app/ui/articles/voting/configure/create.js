import { textbox } from "/components/textbox.js";
import { button } from "/components/button.js";

export default {
	styles: `
		#voting-configure-create { display: grid; grid-gap: 20px; }

		#voting-configure-create-actions { display: grid; grid-gap: 20px; grid-template-columns: auto; }
		#voting-configure-create-actions div app-button { width: 100%; }

		@media all and (min-width: 456px) {
			#voting-configure-create-actions div app-button { width: unset; }
			#voting-configure-create-actions { grid-template-columns: min-content min-content auto; }
		}
	`,

	markup: `
		<div id="voting-configure-create">
			<h2>Create a new template</h2>

			<app-textbox type="textbox" id="voting-configure-create-name" placeholder="Name your template"></app-textbox>
			<app-textbox type="textbox" id="voting-configure-create-expires" placeholder="Limit voting session in seconds"></app-textbox>

			<div id="voting-configure-create-actions">
				<div><app-button id="voting-configure-create-create" text="Create" icon="check" composition="text icon"></app-button></div>
				<div><app-button id="voting-configure-create-cancel" text="Cancel" composition="text" embedded="true"></app-button></div>
			</div>
		</div>
	`,

	script: async _component => {
		const nameElement = _component.use("voting-configure-create-name");
		const expiresElement = _component.use("voting-configure-create-expires");
		nameElement.on("ready", () => nameElement.focus());

		if (_component.shadow) _component.shadow.once("activated", async () => {
			_component.close("cancelled");
		});

		_component.use("voting-configure-create-name").on("activated", async () => {
			_component.use("voting-configure-create-expires").focus();
		});

		_component.use("voting-configure-create-expires").on("activated", async () => {
			_component.use("voting-configure-create-create").emit("activated");
		});

		_component.use("voting-configure-create-cancel").once("activated", async () => {
			_component.close("cancelled");
		});

		_component.use("voting-configure-create-create").on("activated", async () => {
			const nameValid = /^[a-zA-Z0-9 ]+$/.test(nameElement.value());
			if (!nameValid) return globalThis.notify({ text: "Invalid name provided." });

			const expiresValid = /^[0-9]+$/.test(expiresElement.value());
			if (!expiresValid && expiresElement.value() !== "") return globalThis.notify({ text: "Invalid expires provided." });

			const createResponse = await globalThis.fetcher(`/api/voting/template/${_component.parameters.room._id}`, {
				method: "post",
				body: JSON.stringify({
					name: nameElement.value(),
					expires: expiresElement.value() === "" ? null : parseInt(expiresElement.value())
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