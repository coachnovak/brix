import { button } from "/components/button.js";

export default {
	options: {
		position: "center"
	},

	styles: `
		#voting-session { display: grid; grid-gap: 20px; }
		#voting-session-expires { opacity: 0.6; }

		#voting-session-actions { display: inline-grid; grid-gap: 20px; grid-template-columns: auto; }
		#voting-session-actions div app-button { width: 100%; }

		@media all and (min-width: 456px) {
			#voting-session-actions { grid-template-columns: min-content min-content; justify-items: center; }
			#voting-session-actions div app-button { width: unset; }
		}
	`,

	markup: `
		<div id="voting-session">
			<h2 class="center">When you're ready</h2>
			<div class="center"><span id="voting-session-topic"></span> <span id="voting-session-expires"></span></div>
			<app-list id="voting-session-participants"></app-list>
			<div class="center">
				<div id="voting-session-actions">
					<app-button id="voting-session-start" text="Start the session" icon="check" composition="text icon"></app-button>
					<app-button id="voting-session-cancel" text="Cancel" composition="text" embedded="true"></app-button>
				</div>
			</div>
		</div>
	`,

	script: async _component => {
		// Close article if user isn't signed in.
		if (!localStorage.getItem("token")) return _component.close("cancelled");

		if (_component.shadow) _component.shadow.once("activated", async () => {
			_component.use("voting-session-cancel").emit("activated");
		});

		const sessionResponse = await globalThis.fetcher(`/api/voting/session/${_component.parameters.session}`, { method: "get" });
		if (sessionResponse.status !== 200) _component.close("error");
		const session = await sessionResponse.json();

		const topicElement = _component.use("voting-session-topic");
		topicElement.innerText = session.topic;

		const expiresElement = _component.use("voting-session-expires");
		if (session.expires === null) expiresElement.innerText = "has no time limit.";
		else expiresElement.innerText = `has a time limit of ${session.expires} seconds.`;

		const participantsElement = _component.use("voting-session-participants");
		for (let participantIndex = 0; participantIndex < session.participants.length; participantIndex++) {
			const participant = session.participants[participantIndex];
			const participantElement = await participantsElement.add({
				id: participant._id,
				data: participant,
				clickable: false,
				contents: [
					{ icon: participant._id === session.initiator ? "user-crown" : "user" },
					{ text: `${participant.firstName} ${participant.lastName}` }
				]
			});

			participantElement.on("activated", async _event => {

			});
		}

		_component.use("voting-session-start").once("activated", async () => {
			const beginResponse = await globalThis.fetcher(`/api/voting/session/${session._id}/begin/`, {
				method: "put",
				body: JSON.stringify({})
			});

			if (beginResponse.status === 200) {
				_component.close("started");
			} else if (beginResponse.status >= 400) {
				const sessionContentFailure = await beginResponse.json();
				globalThis.notify({ icon: "exclamation-circle", text: sessionContentFailure.message });
			}
		});

		_component.use("voting-session-cancel").once("activated", async () => {
			const deleteResponse = await globalThis.fetcher(`/api/voting/session/${session._id}`, {
				method: "delete",
				body: JSON.stringify({})
			});

			if (deleteResponse.status === 200)
				_component.close("cancelled");
		});
	}
};