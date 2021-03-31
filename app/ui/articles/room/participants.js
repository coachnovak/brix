import throttle from "/components/throttle.js";
import { component } from "/components/component.js";
import { list } from "/components/list.js";

export default {
	templates: () => {
		return {
			style: component.template`
				#list { display: block; }
				#list .empty { padding: 20px; text-align: center; }
			`,
		
			markup: component.template`
				<app-list id="list"></app-list>
			`
		};
	},

	script: async _component => {
		const participantsElement = _component.find("#list");

		const update = async () => {
			const participantsResponse = await globalThis.fetcher(`/api/participants/${_component.parameters.room._id}`, { method: "get" });
			if (participantsResponse.status !== 200) return globalThis.notify([{ icon: "exclamation-circle" }, { text: "Failed to retrieve participants." }]).close(3000);

			const participants = await participantsResponse.json();
			const participantsChildren = Array.from(participantsElement.children());

			// Look for deleted participants.
			Array.from(participantsChildren).forEach(_participantElement => {
				const id = _participantElement.id;
				const exists = participants.find(_participant => `participant-${_participant._id}` === id);
				if (!exists) _participantElement.remove();
			});

			for (let roomIndex = 0; roomIndex < participants.length; roomIndex++) {
				const participant = participants[roomIndex];
				const exists = participantsChildren.find(_participantChild => _participantChild.id === `participant-${participant._id}`)
				if (exists) continue;

				const participantElement = await participantsElement.add({
					id: `participant-${participant._id}`,
					data: participant,
					contents: [
						{ icon: "user" },
						{ text: `${participant.user.firstName} ${participant.user.lastName}` },
						{ since: participant.registered }
					]
				});

				const doPoke = throttle.setup(async _event => {
					const pokeResponse = await globalThis.fetcher(`/api/participant/${_component.parameters.room._id}/poke/${_event.data.user._id}`, { method: "get" });
					if (pokeResponse.status !== 200) return globalThis.notify([{ icon: "info-circle" }, { text: "Failed to poke participant." }]).close(3000);
				}, 2000);

				participantElement.events.on("activated", async _event => doPoke(_event));
			}

			_component.timers.once(3000, () => update());
		}

		await update();
	}
};