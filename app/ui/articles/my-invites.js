import { list } from "/components/list.js";
import { textbox } from "/components/textbox.js";

export default {
	options: {
		shelf: true
	},

	styles: `
		#my-invites-head { margin-bottom: 20px; }
		#my-invites-waiting.hide { display: none; }
	`,

	markup: `
		<div id="my-invites" class="my-invites container">
			<div id="my-invites-head" class="center">
				<h3>Invitations</h3>
			</div>

			<div id="my-invites-waiting" class="center">
				No invites received, yet.
			</div>

			<div id="my-invites-select">
				<app-list id="my-invites-list"></app-list>
			</div>
		</div>
	`,

	script: async _component => {
		let scheduledUpdateTimer = null;

		const updateMyRooms = async () => {
			// Close article if user isn't signed in.
			if (!localStorage.getItem("token")) return _component.close();

			const invitesElement = _component.use("my-invites-list");
			const invitesResponse = await globalThis.fetcher(`/api/my/invites/`, { method: "get" });
			if (invitesResponse.status !== 200) return globalThis.contents.close("my-invites");

			const invites = await invitesResponse.json();
			for (let inviteIndex = 0; inviteIndex < invites.length; inviteIndex++) {
				const existingInvite = invitesElement.use(invites[inviteIndex]._id);
				const invite = invites[inviteIndex];
				const room = `Join ${invite.room.name}`;

				if (existingInvite) {
					existingInvite.use("text").innerHTML = room;
				} else {
					const inviteElement = await invitesElement.add({
						id: invite._id,
						data: invite,
						contents: [
							{ icon: "booth-curtain" },
							{ text: room },
							{ arrow: true }
						]
					});

					inviteElement.on("activated", _event => {
						globalThis.contents.close();
						globalThis.contents.open({ name: "room", parameters: { id: _event.detail.room._id } });
					});
				}
			}

			if (invites.length > 0) _component.use("my-invites-waiting").classList.add("hide");
			else _component.use("my-invites-waiting").classList.remove("hide");

			if (scheduledUpdateTimer !== null)
				scheduledUpdateTimer = setTimeout(() => updateMyRooms(), 4000);
		};

		_component.on("disposing", () => {
			clearTimeout(scheduledUpdateTimer);
			scheduledUpdateTimer = 0;
		});

		updateMyRooms();
	}
};