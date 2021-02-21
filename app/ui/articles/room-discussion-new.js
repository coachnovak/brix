export default {
	styles: `
		#discussion-new { display: grid; grid-template-columns: auto min-content; grid-gap: 20px; }
	`,

	markup: `
		<div id="discussion-new">
			<app-textbox id="discussion-new-comment" placeholder="Speak your mind..."></app-textbox>
			<app-button id="discussion-new-publish" icon="paper-plane" composition="icon"></app-button>
		</div>
	`,

	script: async _component => {
		// Close article if user isn't signed in.
		if (!localStorage.getItem("token")) return globalThis.contents.close("comments");

		const newTextboxElement = _component.use("discussion-new-comment");
		const newButtonElement = _component.use("discussion-new-publish");

		const publish = () => {
			const value = newTextboxElement.value();
			newTextboxElement.clear();

			if (value) _component.parameters.stream.send("comment", value);
		}

		newTextboxElement.on("activated", () => publish());
		newButtonElement.on("activated", () => publish());
	}
};