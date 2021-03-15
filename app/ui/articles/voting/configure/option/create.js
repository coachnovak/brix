import { textbox } from "/components/textbox.js";
import { button } from "/components/button.js";

export default {
	styles: `
		#voting-configure-create-option { display: grid; grid-gap: 20px; }

		#voting-configure-create-option-actions { display: grid; grid-gap: 20px; grid-template-columns: auto; }
		#voting-configure-create-option-actions div app-button { width: 100%; }

		@media all and (min-width: 456px) {
			#voting-configure-create-option-actions div app-button { width: unset; }
			#voting-configure-create-option-actions { grid-template-columns: min-content min-content auto; }
		}
	`,

	markup: `
		<div id="voting-configure-create-option">
			<h2>Create a new template</h2>

			<app-textbox type="textbox" id="voting-configure-create-option-icon" placeholder="Name your icon to use"></app-textbox>
			<app-textbox type="textbox" id="voting-configure-create-option-label" placeholder="Label your option"></app-textbox>

			<div id="voting-configure-create-option-actions">
				<div><app-button id="voting-configure-create-option-create" text="Create" icon="check" composition="text icon"></app-button></div>
				<div><app-button id="voting-configure-create-option-cancel" text="Cancel" composition="text" embedded="true"></app-button></div>
			</div>
		</div>
	`,

	script: async _component => {
		if (_component.shadow) _component.shadow.once("activated", async () => {
			_component.close("cancelled");
		});

		const iconElement = _component.use("voting-configure-create-option-icon");
		iconElement.on("ready", () => { iconElement.value("vote-yea"); iconElement.focus() });
		iconElement.on("activated", () => labelElement.focus());

		const labelElement = _component.use("voting-configure-create-option-label");
		labelElement.on("activated", () => _component.use("voting-configure-create-option-create").emit("activated"));

		_component.use("voting-configure-create-option-create").on("activated", async () => {
			const iconValid = /^[a-z-]+$/.test(iconElement.value());
			if (!iconValid) return globalThis.notify({ text: "Invalid icon provided." });

			const labelValid = /^[a-zA-Z0-9 ]+$/.test(labelElement.value());
			if (!labelValid) return globalThis.notify({ text: "Invalid label provided." });

			const createResponse = await globalThis.fetcher(`/api/voting/template/${_component.parameters.template._id}/option/`, {
				method: "post",
				body: JSON.stringify({
					icon: iconElement.value(),
					label: labelElement.value()
				})
			});

			switch (createResponse.status) {
				case 201:
					_component.close("created");
					break;

			}
		});

		_component.use("voting-configure-create-option-cancel").once("activated", async () => {
			_component.close("cancelled");
		});
	}
};