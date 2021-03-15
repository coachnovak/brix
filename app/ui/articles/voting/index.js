import { button } from "/components/button.js";

export default {
	options: {
		position: "center"
	},

	styles: `
		#voting { display: grid; grid-gap: 20px; }
	`,

	markup: `
		<div id="voting">
			<h2>Start with a template</h2>
			<app-textbox type="textbox" id="voting-topic" placeholder="Set topic for this session"></app-textbox>
			<app-list id="voting-templates"></app-list>
			<div class="center"><app-button id="voting-cancel" text="Cancel" composition="text" embedded="true"></app-button></div>
		</div>
	`,

	script: async _component => {
		// Close article if user isn't signed in.
		if (!localStorage.getItem("token")) return _component.close("cancelled");

		if (_component.shadow) _component.shadow.once("activated", async () => {
			_component.close("cancelled");
		});

		const topicElement = _component.use("voting-topic");
		const templatesElement = _component.use("voting-templates");
		const templatesResponse = await globalThis.fetcher(`/api/voting/templates/${_component.parameters.room._id}`, { method: "get" });
		if (templatesResponse.status !== 200) _component.close("error");

		const templates = await templatesResponse.json();
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

			templateElement.on("activated", async _event => {
				const newSessionResponse = await globalThis.fetcher(`/api/voting/session/${_event.detail._id}`, {
					method: "post",
					body: JSON.stringify({
						topic: topicElement.value() === "" ? template.name : topicElement.value()
					})
				});

				if (newSessionResponse.status == 201) {
					const session = await newSessionResponse.json();
					globalThis.windows.open({ name: "voting/session/index", parameters: { session: session._id } });
					_component.close("selected");
				} else if (newSessionResponse.status > 400 && newSessionResponse.status < 499) {
					const newSessionFailure = newSessionResponse.json();
					globalThis.notify({ icon: "exclamation-circle", text: newSessionFailure.message });
				}
			});
		}

		_component.use("voting-cancel").once("activated", () => {
			_component.close("cancelled");
		});
	}
};