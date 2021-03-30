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
				#expires { opacity: 0.6; }
				#actions app-button { width: 100%; }
		
				@media (orientation: landscape) {
					#actions app-button { width: unset; position: relative; left: 50%; transform: translateX(-50%); }
				}
			`,

			markup: component.template`
				<div id="layout">
					<h2 class="center">When you're ready</h2>
		
					<div class="center"><span id="topic"></span> <span id="expires"></span></div>
		
					<app-list id="participants"></app-list>
		
					<div id="actions">
						<app-button id="start" text="Start the session" icon="check" composition="text icon"></app-button>
					</div>
				</div>
			`
		};
	},

	script: async _component => {
		_component.shadow && _component.shadow.events.on("activated", async () => {
			_component.find("#cancel").emit("activated");
		});

		const sessionResponse = await globalThis.fetcher(`/api/voting/session/${_component.parameters.session}`, { method: "get" });
		if (sessionResponse.status !== 200) _component.close("error");
		const session = await sessionResponse.json();

		const topicElement = _component.find("#topic");
		topicElement.innerText = session.topic;

		const expiresElement = _component.find("#expires");
		if (session.expires === null) expiresElement.innerText = "has no time limit.";
		else expiresElement.innerText = `has a time limit of ${session.expires} seconds.`;

		const participantsElement = _component.find("#participants");
		for (let participantIndex = 0; participantIndex < session.participants.length; participantIndex++) {
			const participant = session.participants[participantIndex];
			const participantElement = await participantsElement.add({
				id: `participant-${participant._id}`,
				data: participant,
				clickable: false,
				contents: [
					{ icon: participant._id === session.initiator ? "user-crown" : "user" },
					{ text: `${participant.firstName} ${participant.lastName}` }
				]
			});

			participantElement.events.on("activated", async _event => {

			});
		}

		_component.find("#start").events.on("activated", async () => {
			const beginResponse = await globalThis.fetcher(`/api/voting/session/${session._id}/begin/`, {
				method: "put",
				body: JSON.stringify({})
			});

			if (beginResponse.status === 200) {
				_component.close("started");
			} else if (beginResponse.status >= 400) {
				const sessionContentFailure = await beginResponse.json();
				globalThis.notify([{ icon: "exclamation-circle" }, { text: sessionContentFailure.message }]).close(3000);
			}
		});

		_component.events.on("closed", async () => {
			const deleteResponse = await globalThis.fetcher(`/api/voting/session/${session._id}`, {
				method: "delete",
				body: JSON.stringify({})
			});

			if (deleteResponse.status === 200)
				_component.close("cancelled");
		});
	}
};