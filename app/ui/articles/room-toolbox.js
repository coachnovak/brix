export default {
	styles: `

	`,

	markup: `
		<app-list id="room-toolbox-list"></app-list>
	`,

	script: async _component => {
		// Close article if user isn't signed in.
		if (!localStorage.getItem("token")) return globalThis.article.close("tools");

		const utilitiesElement = _component.use("room-toolbox-list");

		const estimateEffortElement = await utilitiesElement.add({
			id: "estimate-effort",
			contents: [
				{ icon: "ruler-combined" },
				{ text: "Estimate effort" },
				{ arrow: true }
			]
		});

		estimateEffortElement.on("activated", _event => {
			// globalThis.article.open([
			// 	{ name: "estimate-effort", parameters: _component.parameters }
			// ]);
		});

		_component.on("disposing", () => {
			globalThis.article.close("room-participants");
		});
	}
};