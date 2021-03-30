import { component } from "/components/component.js";
import { button } from "/components/button.js";

export default {
	options: {
		position: "center"
	},

	templates: () => {
		return {
			style: component.template`
				:host([type]) { width: var(--size-s); }
		
				#layout { display: grid; grid-gap: var(--spacing); }
				#expires { opacity: 0.5; }
				#actions app-button { width: 100%; }
		
				@media (orientation: landscape) {
					#actions app-button { width: unset; position: relative; left: 50%; transform: translateX(-50%); }
				}
			`,
		
			markup: component.template`
				<div id="layout">
					<h2 id="name">Configure voting templates</h2>
					<div id="expires"></div>
		
					<app-list id="options"></app-list>
		
					<div id="actions">
						<app-button id="delete" text="Delete template" composition="text" secondary="true"></app-button>
					</div>
				</div>
			`
		};
	},

	script: async _component => {
		_component.shadow && _component.shadow.events.on("activated", async () => {
			_component.close("cancelled");
		});

		const nameElement = _component.find("#name");
		const expiresElement = _component.find("#expires");
		const optionsElement = _component.find("#options");

		const refresh = async () => {
			const templateResponse = await globalThis.fetcher(`/api/voting/template/${_component.parameters.template._id}`, { method: "get" });

			if (templateResponse.status !== 200) {
				globalThis.notify([{ text: "We can't find the template you're trying to open." }]).close(3000);
				return _component.close("error");
			}
	
			const template = await templateResponse.json();
			nameElement.innerText = template.name;
			expiresElement.innerText = template.expires === null ? `No session expiration` : `Session expires after ${template.expires}s`;
			optionsElement.clear();

			for (let optionIndex = 0; optionIndex < template.options.length; optionIndex++) {
				const option = template.options[optionIndex];
				const optionElement = await optionsElement.add({
					id: `option-${option._id}`,
					data: option,
					contents: [
						{ icon: option.icon },
						{ text: option.label },
						{ delete: true }
					]
				});
	
				optionElement.events.on("activated", async _event => {
					const optionResponse = await globalThis.fetcher(`/api/voting/template/${_component.parameters.template._id}/option/${_event.data._id}`, { method: "delete" });

					if (optionResponse.status === 200) refresh();
					else globalThis.notify([{ text: "We couldn't delete the option." }]).close(3000);
				});
			}
	
			const createElement = await optionsElement.add({
				id: "create",
				contents: [
					{ icon: "sparkles" },
					{ text: "Create an option" },
					{ arrow: true }
				]
			});
	
			createElement.events.on("activated", _event => {
				globalThis.windows
					.open({ name: "voting/configure/option/create", parameters: _component.parameters })
					.events.on("created", refresh);
			});
		};

		refresh();

		_component.find("#delete").events.on("activated", async () => {
			const deleteResponse = await globalThis.fetcher(`/api/voting/template/${_component.parameters.template._id}`, { method: "delete" });

			if (deleteResponse.status === 200) _component.close("deleted");
			else globalThis.notify([{ text: "We couldn't delete the template." }]).close(3000);
		});
	}
};