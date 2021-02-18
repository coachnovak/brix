import { button } from "/components/button.js";

export default {
	styles: `
		#estimate-effort-manage { text-align: center; }

		@media all and (min-width: 476px) {
			#estimate-effort-manage {  }
		}
	`,

	markup: `
		<div id="estimate-effort">
			<div id="estimate-effort-manage">
				<app-button id="estimate-effort-manage-new" icon="dice" text="New turn" composition="vertical icon text" size="large" embedded="true"></app-button>
			</div>
		</div>
	`,

	script: async _component => {
		// Close article if user isn't signed in.
		if (!localStorage.getItem("token")) return globalThis.article.close("estimate-effort");

		const manageNewElement = _component.use("estimate-effort-manage-new");
		manageNewElement.on("activated", () => {
			const turnid = Math.random().toString(36).substr(2, 6).toUpperCase();
			const options = [
				{ id: "skip", icon: "vote-nay", text: "Skip this turn" },
				{ id: "req", icon: "page-break", text: "Requires refinement" },
				{ id: "sp1", icon: "vote-yea", text: "Vote 1 story point" },
				{ id: "sp2", icon: "vote-yea", text: "Vote 2 story points" },
				{ id: "sp4", icon: "vote-yea", text: "Vote 4 story points" },
				{ id: "sp8", icon: "vote-yea", text: "Vote 8 story points" }
			];

			globalThis.article.close("estimate-effort");
			_component.parameters.stream.send("new-estimate-work", { turnid, options });
		});

		_component.on("disposing", () => {

		});
	}
};