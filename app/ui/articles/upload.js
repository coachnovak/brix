import { component } from "/components/component.js";
import { file } from "/components/file.js";
import { button } from "/components/button.js";

export default {
	options: {
		full: true
	},

	templates: () => {
		return {
			style: component.template`
				:host([type]) { width: var(--size-s); }

				#layout { display: grid; grid-template-rows: auto; grid-gap: var(--spacing); }
				#actions app-button { width: 100%; }
		
				@media (orientation: landscape) {
					#actions app-button { width: unset; position: relative; left: 50%; transform: translateX(-50%); }
				}
			`,
		
			markup: component.template`
				<div id="layout">
					<div id="form">
						<app-file></app-file>
					</div>
				</div>
			`
		};
	},

	script: async _component => {
		_component.shadow && _component.shadow.events.on("activated", async () => {
			_component.close("cancelled");
		});

		_component.find("app-file").events.on("selected", async _files => {
			_component.close("upload", _files);
		});
	}
};