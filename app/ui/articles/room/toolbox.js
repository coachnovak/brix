import { component } from "/components/component.js";

export default {
	templates: () => {
		return {
			style: component.template`

			`,
		
			markup: component.template`
				<app-list id="room-toolbox-list"></app-list>
			`
		};
	},

	script: async _component => {
		const toolboxElement = _component.find("#room-toolbox-list");

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

		_component.events.on("disposed", () => {
			globalThis.contents.close("room-participants");
		});
	}
};