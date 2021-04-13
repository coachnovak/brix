import { component } from "/components/component.js";

export default {
	templates: () => {
		return {
			style: component.template`
				#list { margin-top: var(--spacing); }
			`,
		
			markup: component.template`
				<h3>Toolbox</h3>
				<app-list id="list"></app-list>
			`
		};
	},

	script: async _component => {
		const toolboxElement = _component.find("#list");

		const votingElement = await toolboxElement.add({
			id: "voting",
			contents: [
				{ icon: "vote-yea" },
				{ text: "Start a new voting session" },
				{ arrow: true }
			]
		});

		votingElement.events.on("activated", _event => {
			globalThis.windows.open({ name: "voting/index", parameters: _component.parameters });
		});
	}
};