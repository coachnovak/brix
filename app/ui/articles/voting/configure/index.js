import { button } from "/components/button.js";

export default {
	options: {
		position: "center"
	},

	styles: `
		#voting-configure { display: grid; grid-gap: 20px; }
	`,

	markup: `
		<div id="voting-configure">
			<h2>Configure voting templates</h2>
			<app-list id="voting-configure-templates"></app-list>
			<div class="center"><app-button id="voting-configure-close" text="Close" composition="text" embedded="true"></app-button></div>
		</div>
	`,

	script: async _component => {
		// Close article if user isn't signed in.
		if (!localStorage.getItem("token")) return _component.close("cancelled");

		if (_component.shadow) _component.shadow.once("activated", async () => {
			_component.close("cancelled");
		});

		const refresh = async () => {
			const templatesElement = _component.use("voting-configure-templates");
			const templatesResponse = await globalThis.fetcher(`/api/voting/templates/${_component.parameters.room._id}`, { method: "get" });
			if (templatesResponse.status !== 200) return _component.close("error");
	
			const templates = await templatesResponse.json();
			templatesElement.clear();

			for (let templateIndex = 0; templateIndex < templates.length; templateIndex++) {
				const template = templates[templateIndex];
				const text = template.name;
	
				const templateElement = await templatesElement.add({
					id: template._id,
					data: template,
					contents: [
						{ icon: "box-ballot" },
						{ text: text },
						{ arrow: true }
					]
				});
	
				templateElement.on("activated", _event => {
					globalThis.windows.open({
						name: "voting/configure/template",
						parameters: { room: _component.parameters.room._id, template: _event.detail }
					}).once("deleted", refresh);;
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
	
			createElement.on("activated", _event => {
				globalThis.windows
					.open({ name: "voting/configure/create", parameters: _component.parameters })
					.once("created", refresh);
			});
		};

		await refresh();

		_component.use("voting-configure-close").once("activated", () => {
			_component.close("closed");
		});

		_component.on("disposing", () => {

		});
	}
};