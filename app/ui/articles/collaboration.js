import { options } from "/components/options.js";

export default {
	styles: `
		.collaboration.container { display: block; }
		.collaboration.container app-list { display: block; }
	`,

	markup: `
		<app-list id="utilities.list" break="3"></app-list>
	`,

	script: async _component => {
		// Close article if user isn't signed in.
		if (!localStorage.getItem("token")) return globalThis.article.close("tools");

		const utilitiesElement = _component.use("utilities.list");
		const forwardParameters = { room: _component.parameters.room, stream: _component.parameters.stream };

		const discussionElement = await utilitiesElement.add({
			id: "discussion",
			contents: [
				{ icon: "comments-alt" },
				{ text: "Discussion" },
				{ arrow: true }
			]
		});

		discussionElement.on("activated", _event => {
			globalThis.article.cut("reactions");
			globalThis.article.open([
				{ name: "room-back", parameters: { cut: "reactions", open: { name: "collaboration", parameters: forwardParameters } } },
				{ name: "discussion", parameters: forwardParameters }
			]);
		});

		const estimateEffortElement = await utilitiesElement.add({
			id: "estimate-effort",
			contents: [
				{ icon: "ruler-combined" },
				{ text: "Estimate effort" },
				{ arrow: true }
			]
		});

		estimateEffortElement.on("activated", _event => {
			globalThis.article.cut("reactions");
			globalThis.article.open([
				{ name: "room-back", parameters: { cut: "reactions", open: { name: "collaboration", parameters: forwardParameters }} },
				{ name: "estimate-effort", parameters: forwardParameters }
			]);
		});

		const timelineElement = await utilitiesElement.add({
			id: "timeline",
			contents: [
				{ icon: "history" },
				{ text: "Events timeline" },
				{ arrow: true }
			]
		});

		timelineElement.on("activated", _event => {
			globalThis.article.cut("reactions");
			globalThis.article.open([
				{ name: "room-back", parameters: { cut: "reactions", open: { name: "collaboration", parameters: forwardParameters }} },
				{ name: "room-timeline", parameters: forwardParameters }
			]);
		});

		globalThis.article.open([
			{ name: "room-participants", parameters: forwardParameters }
		]);

		_component.on("disposing", () => {
			globalThis.article.close("room-participants");
		});
	}
};