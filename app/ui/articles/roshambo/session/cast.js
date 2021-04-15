import { component } from "/components/component.js";
import { button } from "/components/button.js";
import { progress } from "/components/progress.js";
import { loader } from "/components/loader.js";

export default {
	options: {
		position: "center"
	},

	templates: () => {
		return {
			style: component.template`
				:host([type]) { width: var(--size-s); }
		
				#layout { display: grid; grid-gap: 20px; }
				#banner { display: grid; grid-template-columns: auto auto auto; grid-gap: var(--spacing); padding-top: var(--spacing); }
			`,
		
			markup: component.template`
				<div id="layout">
					<h2 class="center">Challenge commenced</h2>

					<div id="banner">
						<app-button id="rock" icon="hand-rock" text="Rock" composition="vertical icon text" size="huge" embedded="true"></app-button>
						<app-button id="paper" icon="hand-paper" text="Paper" composition="vertical icon text" size="huge" embedded="true"></app-button>
						<app-button id="scissor" icon="hand-scissors" text="Scissors" composition="vertical icon text" size="huge" embedded="true"></app-button>
					</div>
				</div>
			`
		};
	},

	script: async _component => {
		await globalThis.fetcher(`/api/roshambo/session/${_component.parameters.session}`, {
			method: "get"
		}, {
			200: async _response => {
				const session = await _response.json();
				_component.find("#rock").events.on("activated", async () => {
					// Cast 'rock' to session.
					await globalThis.fetcher(`/api/roshambo/session/${session._id}/cast/rock`, {
						method: "put",
						body: JSON.stringify({})
					}, {
						200: () => _component.close()
					});
				});

				_component.find("#paper").events.on("activated", async () => {
					// Cast 'paper' to session.
					await globalThis.fetcher(`/api/roshambo/session/${session._id}/cast/paper`, {
						method: "put",
						body: JSON.stringify({})
					}, {
						200: () => _component.close()
					});
				});
		
				_component.find("#scissor").events.on("activated", async () => {
					// Cast 'scissor' to session.
					await globalThis.fetcher(`/api/roshambo/session/${session._id}/cast/scissor`, {
						method: "put",
						body: JSON.stringify({})
					}, {
						200: () => _component.close()
					});
				});
			},
			404: async _response => _component.close("error"),
			500: async _response => _component.close("error")
		});
	}
};