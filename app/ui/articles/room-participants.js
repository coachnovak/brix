import { list } from "/components/list.js";

export default {
	styles: `
		#room-participants-list { display: block; }
		#room-participants-list .empty { padding: 20px; text-align: center; }
	`,

	markup: `
		<app-list id="room-participants-list"></app-list>
	`,

	script: async _component => {
		// Close article if user isn't signed in.
		if (!localStorage.getItem("token")) return globalThis.content.close("participants");

		let scheduledUpdateTimer = null;
		const participantsElement = _component.use("room-participants-list");

		const update = async () => {
			if (!localStorage.getItem("token")) return globalThis.content.close("participants");

			const participantsResponse = await globalThis.fetcher(`/api/participants/${_component.parameters.room._id}`, { method: "get" });
			if (participantsResponse.status !== 200) return;

			const participants = await participantsResponse.json();
			const participantsChildren = Array.from(participantsElement.children());

			// Look for deleted participants.
			Array.from(participantsChildren).forEach(_participantElement => {
				const id = _participantElement.id;
				const exists = participants.find(_participant => _participant._id === id);
				if (!exists) _participantElement.remove();
			});

			for (let roomIndex = 0; roomIndex < participants.length; roomIndex++) {
				const participant = participants[roomIndex];
				const exists = participantsChildren.find(_participantChild => _participantChild.id === participant._id)

				if (exists) {
					continue;
				}

				const participantElement = await participantsElement.add({
					id: participant._id,
					data: participant,
					contents: [
						{ icon: "user" },
						{ text: `${participant.user.firstName} ${participant.user.lastName}` },
						{ since: participant.registered }
					]
				});

				participantElement.on("activated", _event => {
					_component.parameters.stream.send("poke", participant.user);
				});
			}

			scheduledUpdateTimer = setTimeout(() => update(), 3000);
		}

		_component.on("disposing", () => {
			clearTimeout(scheduledUpdateTimer);
		});

		await update();
	}
};