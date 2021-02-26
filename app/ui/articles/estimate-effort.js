import { button } from "/components/button.js";

export default {
	options: {
		position: "center"
	},

	styles: `
		#estimate-effort-manage-head { margin-bottom: 20px; }
		#estimate-effort-manage { text-align: center; }

		@media all and (min-width: 476px) {
			#estimate-effort-manage {  }
		}
	`,

	markup: `
		<div id="estimate-effort">
			<div id="estimate-effort-manage">
				<h2 id="estimate-effort-manage-head">Estimation effort</h2>
				<app-button id="estimate-effort-manage-new" icon="dice" text="Start a new turn" composition="vertical icon text" size="large"></app-button><br />
				<br />
				<app-button id="estimate-effort-manage-cancel" text="Cancel" composition="text" embedded="true"></app-button>
			</div>
		</div>
	`,

	script: async _component => {
		// Close article if user isn't signed in.
		if (!localStorage.getItem("token")) return _component.close("cancelled");

		if (_component.shadow) _component.shadow.once("activated", async () => {
			_component.close("cancelled");
		});

		_component.use("estimate-effort-manage-new").once("activated", () => {
			const currentUser = document.getElementById("identity").user;
			const by = `${currentUser.firstName} ${currentUser.lastName}`;
			const when = new Date();
			const turnid = Math.random().toString(36).substr(2, 6).toUpperCase();
			const options = [
				{ id: "skip", icon: "vote-nay", text: "Skip this turn" },
				{ id: "req", icon: "page-break", text: "Requires refinement" },
				{ id: "sp1", icon: "vote-yea", text: "1 story point" },
				{ id: "sp2", icon: "vote-yea", text: "2 story points" },
				{ id: "sp4", icon: "vote-yea", text: "4 story points" },
				{ id: "sp8", icon: "vote-yea", text: "8 story points" }
			];

			_component.close("started");
			_component.parameters.stream.send("new-estimate-effort", { turnid, options, by, when });
		});

		_component.use("estimate-effort-manage-cancel").once("activated", () => {
			_component.close("started");
		});

		_component.on("disposing", () => {

		});
	}
};