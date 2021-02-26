import { list } from "/components/list.js";

export default {
	styles: `
		#room-invites-head { margin-bottom: 20px; }
		#room-invites-list { display: block; }
		#room-invites-list .empty { padding: 20px; text-align: center; }
		#room-invites-invitation { margin-top: 20px; text-align: center; }
	`,

	markup: `
		<h3 id="room-invites-head" class="center">Invitations</h3>
		<app-list id="room-invites-list"></app-list>
		<div id="room-invites-invitation">
			<app-button id="room-invites-invite" text="Invite someone" icon="share-alt" composition="text icon"></app-button>
		</div>
	`,

	script: async _component => {
		// Close article if user isn't signed in.
		if (!localStorage.getItem("token")) return _component.close();

		// Close article if user doesn't own the room.
		const currentUserId = document.getElementById("identity").user._id;
		if (_component.parameters.room.owner !== currentUserId) return _component.close()

		let scheduledUpdateTimer = null;
		const invitesElement = _component.use("room-invites-list");

		const update = async () => {
			// Close article if user isn't signed in.
			if (!localStorage.getItem("token")) return _component.close();

			const invitesResponse = await globalThis.fetcher(`/api/room/invites/${_component.parameters.room._id}`, { method: "get" });
			if (invitesResponse.status !== 200) return globalThis.notify({ icon: "exclamation-circle", text: "Failed to retrieve invites." });

			const invites = await invitesResponse.json();
			const invitesChildren = Array.from(invitesElement.children());

			// Look for deleted invites.
			Array.from(invitesChildren).forEach(_invitesElement => {
				const id = _invitesElement.id;
				const exists = invites.find(_invite => _invite._id === id);
				if (!exists) _invitesElement.remove();
			});

			for (let roomIndex = 0; roomIndex < invites.length; roomIndex++) {
				const invite = invites[roomIndex];
				const exists = invitesChildren.find(_inviteChild => _inviteChild.id === invite._id)
				if (exists) continue;

				const inviteElement = await invitesElement.add({
					id: invite._id,
					data: invite,
					contents: [
						{ icon: "share-alt" },
						{ text: `${invite.recipient.firstName} ${invite.recipient.lastName}` },
						{ until: invite.expires }
					]
				});

				inviteElement.on("activated", async _event => {
					// Delete the invitation.
					const deleteResponse = await globalThis.fetcher(`/api/room/invites/${invite._id}`, { method: "delete" });
					if (deleteResponse.status !== 200) return globalThis.notify({ icon: "exclamation-circle", text: "Failed to revoke invite." });

					// Update list.
					update();
				});
			}

			// Article has been disposed.
			if (scheduledUpdateTimer !== 0)
				scheduledUpdateTimer = setTimeout(() => update(), 3000);
		}

		_component.use("room-invites-invite").on("activated", () => {
			globalThis.windows
				.open({ name: "room-invite", parameters: { room: _component.parameters.room } })
				.once("invited", _event => update());
		});

		_component.on("disposing", () => {
			clearTimeout(scheduledUpdateTimer);
			scheduledUpdateTimer = 0;
		});

		await update();
	}
};