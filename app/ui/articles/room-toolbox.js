export default {
	styles: `

	`,

	markup: `
		<app-list id="room-toolbox-list"></app-list>
	`,

	script: async _component => {
		// Close article if user isn't signed in.
		if (!localStorage.getItem("token")) return _component.close();

		const utilitiesElement = _component.use("room-toolbox-list");

		const votingElement = await utilitiesElement.add({
			id: "voting",
			contents: [
				{ icon: "vote-yea" },
				{ text: "Start a new voting session" },
				{ arrow: true }
			]
		});

		votingElement.on("activated", _event => {
			globalThis.windows.open({ name: "voting/index", parameters: _component.parameters });
		});

		_component.on("disposing", () => {
			globalThis.contents.close("room-participants");
		});
	}
};