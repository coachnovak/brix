import { component } from "/components/component.js";
import { list } from "/components/list.js";

export default {
	options: {
		position: "center"
	},

	templates: () => {
		return {
			style: component.template`
				#head { margin-bottom: 20px; }
				#list { display: block; }
				#list .empty { padding: 20px; text-align: center; }
				#invitation { margin-top: 20px; text-align: center; }
			`,
		
			markup: component.template`
				<h3 id="head" class="center">Invitations</h3>
				<app-list id="list"></app-list>
				<div id="invitation">
					<app-button id="invite" text="Invite someone" icon="share-alt" composition="text icon"></app-button>
				</div>
			`
		};
	},

	script: async _component => {
		const invitesElement = _component.find("#list");

		const update = async () => {
			const invitesResponse = await globalThis.fetcher(`/api/room/invites/${_component.parameters.room._id}`, { method: "get" });
			if (invitesResponse.status !== 200) return globalThis.notify([{ icon: "exclamation-circle" }, { text: "Failed to retrieve invites." }]).close(3000);

			const invites = await invitesResponse.json();
			const invitesChildren = Array.from(invitesElement.children());

			// Look for deleted invites.
			Array.from(invitesChildren).forEach(_invitesElement => {
				const id = _invitesElement.id;
				const exists = invites.find(_invite => `invite-${_invite._id}` === id);
				if (!exists) _invitesElement.remove();
			});

			for (let roomIndex = 0; roomIndex < invites.length; roomIndex++) {
				const invite = invites[roomIndex];
				const exists = invitesChildren.find(_inviteChild => _inviteChild.id === `invite-${invite._id}`);
				if (exists) continue;

				const inviteElement = await invitesElement.add({
					id: `invite-${invite._id}`,
					data: invite,
					contents: [
						{ icon: "share-alt" },
						{ text: `${invite.recipient.firstName} ${invite.recipient.lastName}` },
						{ until: invite.expires }
					]
				});

				inviteElement.events.on("activated", async _event => {
					// Delete the invitation.
					const deleteResponse = await globalThis.fetcher(`/api/room/invites/${_event.data._id}`, { method: "delete" });
					if (deleteResponse.status !== 200) return globalThis.notify([{ icon: "exclamation-circle" }, { text: "Failed to revoke invite." }]).close(3000);

					// Update list.
					update();
				});
			}
		}

		_component.find("#invite").events.on("activated", () => {
			globalThis.windows
				.open({ name: "room/invite", parameters: { room: _component.parameters.room } })
				.events.on("invited", _event => update());
		});

		await update();
	}
};