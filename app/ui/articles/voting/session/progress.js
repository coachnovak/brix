import { button } from "/components/button.js";

export default {
	options: {
		position: "center"
	},

	styles: `
		#voting-session-progress { display: grid; grid-gap: 20px; }
		#voting-session-progress-expires { opacity: 0.6; }
	`,

	markup: `
		<div id="voting-session-progress">
			<h2 class="center">When ready, collect ballots</h2>
			<div class="center"><span id="voting-session-progress-topic"></span> <span id="voting-session-progress-expires"></span></div>
			<app-list id="voting-session-progress-participants"></app-list>
			<div class="center"><app-button id="voting-session-progress-finish" text="Collect the ballots" icon="ballot" composition="text icon"></app-button></div>
		</div>
	`,

	script: async _component => {
		// Close article if user isn't signed in.
		if (!localStorage.getItem("token")) return _component.close("cancelled");

		const refresh = async () => {
			const sessionResponse = await globalThis.fetcher(`/api/voting/session/${_component.parameters.session}`, { method: "get" });
			if (sessionResponse.status !== 200) _component.close("error");
			const session = await sessionResponse.json();
	
			const topicElement = _component.use("voting-session-progress-topic");
			topicElement.innerText = session.topic;

			const expiresElement = _component.use("voting-session-progress-expires");
			if (session.expires === null) expiresElement.innerText = "has no time limit.";
			else expiresElement.innerText = `has a time limit of ${session.expires} seconds.`;

			const participantsElement = _component.use("voting-session-progress-participants");
			participantsElement.clear();

			for (let participantIndex = 0; participantIndex < session.participants.length; participantIndex++) {
				const participant = session.participants[participantIndex];
				const voted = session.votes.find(_vote => _vote.user === participant._id);
				const contents = [];

				if (voted) contents.push({ icon: "user-check" });
				else contents.push({ icon: "user-clock" });

				contents.push({
					text: `${participant.firstName} ${participant.lastName}`
				});

				await participantsElement.add({
					id: participant._id,
					data: participant,
					clickable: false,
					contents
				});
			}

			_component.timers.refresh = setTimeout(refresh, 2000);
		};

		_component.use("voting-session-progress-finish").once("activated", async () => {
			const beginResponse = await globalThis.fetcher(`/api/voting/session/${_component.parameters.session}/end/`, {
				method: "put",
				body: JSON.stringify({})
			});

			if (beginResponse.status === 200) {
				_component.close("ended");
			} else if (beginResponse.status >= 400) {
				const sessionContentFailure = await beginResponse.json();
				globalThis.notify({ icon: "exclamation-circle", text: sessionContentFailure.message });
			}
		});

		_component.once("disposing", () => {
			clearTimeout(_component.timers.refresh);
		});

		await refresh();
	}
};