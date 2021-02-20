import { list } from "/components/list.js";

export default {
	styles: `
		#estimate-effort-turn-head { margin-bottom: 10px; text-align: center; }
		#estimate-effort-turn-author { font-size: 7pt; text-align: center; margin-bottom: 20px; }
	`,

	markup: `
		<div id="estimate-effort-turn">
			<div id="estimate-effort-turn-head">
				<h3>Voting in session</h3>
			</div>

			<div id="estimate-effort-turn-author">Turn <span id="estimate-effort-turn-id"></span> was initiated by <span id="estimate-effort-turn-by"></span>, <span id="estimate-effort-turn-since"></span>.</div>
			<app-list id="estimate-effort-turn-options" break="2"></app-list>
		</div>
	`,

	script: async _component => {
		// Close article if user isn't signed in.
		if (!localStorage.getItem("token")) return globalThis.content.close("estimate-effort-turn");

		const turnidElement = _component.use("estimate-effort-turn-id");
		const byElement = _component.use("estimate-effort-turn-by");
		const sinceElement = _component.use("estimate-effort-turn-since");

		turnidElement.innerHTML = _component.parameters.turnid;
		byElement.innerHTML = _component.parameters.by;
		sinceElement.setAttribute("datetime", _component.parameters.when);
		timeago.render(sinceElement);

		const optionsElement = _component.use("estimate-effort-turn-options");
		for (let optionIndex = 0; optionIndex < _component.parameters.options.length; optionIndex++) {
			const option = _component.parameters.options[optionIndex];
			const optionElement = await optionsElement.add({
				id: option.id,
				contents: [
					{ icon: option.icon },
					{ text: option.text }
				]
			});

			optionElement.on("activated", () => {
				_component.parameters.stream.send("vote-estimate-work", {
					turnid: _component.parameters.turnid,
					voteid: option.id
				});

				globalThis.content.close("estimate-effort-turn");
			});
		}

		_component.on("disposing", () => {
			timeago.cancel(sinceElement);
		});
	}
};