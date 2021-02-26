import { button } from "/components/button.js";

export default {
	options: {
		position: "side"
	},

	styles: `

	`,

	markup: `
		Sideset window.<br />
		<br />
		<app-button id="cancel" text="Cancel" composition="text"></app-button>
	`,

	script: async _component => {
		_component.use("cancel").once("activated", () => {
			_component.close("cancelled", "No data to send back.");
		});
	}
};