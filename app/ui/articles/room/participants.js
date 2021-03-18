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
		if (!localStorage.getItem("token")) return _component.close();

		let scheduledUpdateTimer = null;
		const participantsElement = _component.use("room-participants-list");

		const update = async () => {
			if (!localStorage.getItem("token")) return globalThis.contents.close("participants");

			const participantsResponse = await globalThis.fetcher(`/api/participants/${_component.parameters.room._id}`, { method: "get" });
			if (participantsResponse.status !== 200) return globalThis.notify({ icon: "exclamation-circle", text: "Failed to retrieve participants." });

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

				participantElement.on("activated", async _event => {
					const pokeResponse = await globalThis.fetcher(`/api/participant/${_component.parameters.room._id}/poke/${participant.user._id}`, { method: "get" });
					if (pokeResponse.status !== 200) return globalThis.notify({ icon: "exclamation-circle", text: "Failed to poke participant." });
				});
			}

			scheduledUpdateTimer = setTimeout(() => update(), 3000);
		}

		_component.on("disposing", () => {
			globalThis.contents.close("room/invites");
			clearTimeout(scheduledUpdateTimer);
		});

		const user = document.getElementById("identity").user;
		if (user && user._id === _component.parameters.room.owner)
			globalThis.contents.open({ name: "room/invites", parameters: _component.parameters });

		await update();
	}
};