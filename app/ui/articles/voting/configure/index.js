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
			`,
		
			markup: component.template`
				<div id="layout">
					<h2>Configure voting templates</h2>
					<app-list id="templates"></app-list>
				</div>
			`
		};
	},

	script: async _component => {
		_component.shadow && _component.shadow.events.on("activated", async () => {
			_component.close("cancelled");
		});

		const refresh = async () => {
			const templatesElement = _component.find("#templates");
			const templatesResponse = await globalThis.fetcher(`/api/voting/templates/${_component.parameters.room._id}`, { method: "get" });
			if (templatesResponse.status !== 200) return _component.close("error");
	
			const templates = await templatesResponse.json();
			templatesElement.clear();

			for (let templateIndex = 0; templateIndex < templates.length; templateIndex++) {
				const template = templates[templateIndex];
				const text = template.name;
	
				const templateElement = await templatesElement.add({
					id: `template-${template._id}`,
					data: template,
					contents: [
						{ icon: "box-ballot" },
						{ text: text },
						{ arrow: true }
					]
				});
	
				templateElement.events.on("activated", _event => {
					globalThis.windows.open({
						name: "voting/configure/template",
						parameters: { room: _component.parameters.room._id, template: _event.data }
					}).events.on("deleted", refresh);;
				});
			}
	
			const createElement = await templatesElement.add({
				id: "create",
				contents: [
					{ icon: "sparkles" },
					{ text: "Create a template" },
					{ arrow: true }
				]
			});
	
			createElement.events.on("activated", _event => {
				globalThis.windows
					.open({ name: "voting/configure/create", parameters: _component.parameters })
					.events.on("created", refresh);
			});
		};

		await refresh();
	}
};