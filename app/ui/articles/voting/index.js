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
					<h2>Start with a template</h2>
					<app-textbox id="voting-topic" placeholder="Set topic for this session"></app-textbox>
					<app-list id="voting-templates"></app-list>
				</div>
			`
		};
	},

	script: async _component => {
		_component.shadow && _component.shadow.events.on("activated", async () => {
			_component.close("cancelled");
		});

		const topicElement = _component.find("#voting-topic");
		topicElement.focus();

		const templatesElement = _component.find("#voting-templates");
		const templatesResponse = await globalThis.fetcher(`/api/voting/templates/${_component.parameters.room._id}`, { method: "get" });
		if (templatesResponse.status !== 200) _component.close("error");

		const templates = await templatesResponse.json();
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

			templateElement.events.on("activated", async _event => {
				const newSessionResponse = await globalThis.fetcher(`/api/voting/session/${_event.data._id}`, {
					method: "post",
					body: JSON.stringify({
						topic: topicElement.value === "" ? template.name : topicElement.value
					})
				});

				if (newSessionResponse.status == 201) {
					const session = await newSessionResponse.json();
					globalThis.windows.open({ name: "voting/session/index", parameters: { session: session._id } });
					_component.close("selected");
				} else if (newSessionResponse.status > 400 && newSessionResponse.status < 499) {
					const newSessionFailure = newSessionResponse.json();
					globalThis.notify([{ icon: "exclamation-circle" }, { text: newSessionFailure.message }]).close(3000);
				}
			});
		}
	}
};