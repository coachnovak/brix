import { component } from "/components/component.js";
import { button } from "/components/button.js";
import { progress } from "/components/progress.js";
import { loader } from "/components/loader.js";

export default {
	options: {
		position: "center",
		closable: false
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
					<h2 class="center">When ready, collect ballots</h2>
		
					<div class="center">
						<span id="topic"></span> <span id="expires"></span>
					</div>
		
					<div class="center">
						<app-loader id="loader"></app-loader>
						<app-progress id="progress"></app-progress>
					</div>
		
					<app-list id="participants"></app-list>
		
					<div id="actions">
						<app-button id="finish" text="Collect the ballots" icon="ballot" composition="text icon"></app-button>
					</div>
				</div>
			`
		};
	},

	script: async _component => {
		const refresh = async (_initial = false) => {
			const sessionResponse = await globalThis.fetcher(`/api/voting/session/${_component.parameters.session}`, {
				method: "get"
			});

			if (sessionResponse.status !== 200) return _component.close("error");
			const session = await sessionResponse.json();

			if (_initial) {
				const topicElement = _component.find("#topic");
				topicElement.innerText = session.topic;

				const expiresElement = _component.find("#expires");
				const loaderElement = _component.find("#loader");
				loaderElement.visible = false;

				const progressElement = _component.find("#progress");
				progressElement.visible = false;

				if (session.expires === null) {
					expiresElement.innerText = "has no time limit.";
					loaderElement.visible = true;
					loaderElement.size = "s";
				} else {
					const now = new Date();
					const expires = new Date(session.begun);
					expires.setSeconds(expires.getSeconds() + session.expires);
		
					const timeleft = (expires.getTime() - now.getTime()) / 100;
					expiresElement.innerText = `has a time limit of ${session.expires} seconds.`;
					progressElement.visible = true;
					progressElement.max = timeleft;
					progressElement.current = timeleft;

					const countdown = () => {
						if (progressElement.current < 1) {
							progressElement.visible = false;
							return;
						}

						progressElement.current--;
						_component.timers.once(100, () => countdown());
					};

					countdown();
				}
			}

			const participantsElement = _component.find("#participants");
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
					id: `participant-${participant._id}`,
					data: participant,
					clickable: false,
					contents
				});
			}

			_component.timers.once(2000, () => refresh());
		};

		_component.find("#finish").events.on("activated", async () => {
			const beginResponse = await globalThis.fetcher(`/api/voting/session/${_component.parameters.session}/end/`, {
				method: "put",
				body: JSON.stringify({})
			});

			if (beginResponse.status === 200) {
				_component.close("ended");
			} else if (beginResponse.status >= 400) {
				const sessionContentFailure = await beginResponse.json();
				globalThis.notify([{ icon: "exclamation-circle" }, { text: sessionContentFailure.message }]).close(3000);
			}
		});

		refresh(true);
	}
};