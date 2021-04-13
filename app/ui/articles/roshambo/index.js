import { component } from "/components/component.js";
import { button } from "/components/button.js";

export default {
	options: {
		position: "center"
	},

	templates: () => {
		return {
			style: component.template`
				:host([type]) { width: var(--size-s); }

				#layout { display: grid; grid-gap: var(--spacing); }
				#banner { display: grid; grid-template-columns: auto auto auto; justify-content: space-between; justify-items: center; padding: var(--spacing); }
				#banner div { text-align: center; }
			`,
		
			markup: component.template`
				<div id="layout">
					<h2>Roshambo</h2>

					<div id="banner">
						<div>
							<app-image icon="hand-rock" size="48px"></app-image>
							Rock
						</div>

						<div>
							<app-image icon="hand-paper" size="48px"></app-image>
							Paper
						</div>

						<div>
							<app-image icon="hand-scissors" size="48px"></app-image>
							Scissor
						</div>
					</div>

					<h3>Select an opponent</h3>

					<app-list id="opponents"></app-list>
				</div>
			`
		};
	},

	script: async _component => {
		_component.shadow && _component.shadow.events.on("activated", async () => {
			_component.close("cancelled");
		});

		await globalThis.fetcher(`/api/participants/${_component.parameters.room._id}`, {
			method: "get"
		}, {
			200: async _response => {
				const opponents = await _response.json();
				const opponentsElement = _component.find("#opponents");

				opponents.forEach(_opponent => {
					// Don't display current user. 
					if (globalThis.session.identity._id === _opponent.user._id) return;

					const itemElement = opponentsElement.add({
						id: `_opponent-${_opponent.user._id}`,
						data: _opponent,
						contents: [
							{ avatar: { user: _opponent.user, size: "xxs" } },
							{ text: `${_opponent.user.firstName} ${_opponent.user.lastName}` }
						]
					});

					itemElement.events.on("activated", async _event => {
						const newSessionResponse = await globalThis.fetcher(`/api/roshambo/session/`, {
							method: "post",
							body: JSON.stringify({
								room: _component.parameters.room._id,
								opponent: _event.data.user._id
							})
						});
		
						if (newSessionResponse.status == 201) {
							_component.close("created");
						} else if (newSessionResponse.status > 400 && newSessionResponse.status < 499) {
							const newSessionFailure = newSessionResponse.json();
							globalThis.notify([{ icon: "exclamation-circle" }, { text: newSessionFailure.message }]).close(3000);
						}
					});
				});
			}
		});
	}
};