import { component } from "/components/component.js";
import { list } from "/components/list.js";
import { textbox } from "/components/textbox.js";

export default {
	options: {
		shelf: true
	},

	templates: () => {
		return {
			style: component.template`
				#head { margin-bottom: 20px; }
				#waiting.hide { display: none; }
			`,
		
			markup: component.template`
				<div id="my-invites" class="my-invites container">
					<div id="head" class="center">
						<h3>Invitations</h3>
					</div>
		
					<div id="waiting" class="center">
						No invites received, yet.
					</div>
		
					<div id="select">
						<app-list id="list"></app-list>
					</div>
				</div>
			`
		};
	},

	script: async _component => {
		let scheduledUpdateTimer = null;

		const updateMyRooms = async () => {
			const invitesElement = _component.find("#list");
			const invitesResponse = await globalThis.fetcher(`/api/my/invites/`, { method: "get" });
			if (invitesResponse.status !== 200) return globalThis.contents.close("my-invites");

			const invites = await invitesResponse.json();
			for (let inviteIndex = 0; inviteIndex < invites.length; inviteIndex++) {
				const invite = invites[inviteIndex];
				const room = `Join ${invite.room.name}`;
				const existingInvite = invitesElement.find(`#invite-${invite._id}`);

				if (existingInvite) {
					existingInvite.use("text").innerHTML = room;
				} else {
					const inviteElement = await invitesElement.add({
						id: `invite-${invite._id}`,
						data: invite,
						contents: [
							{ icon: "booth-curtain" },
							{ text: room },
							{ arrow: true }
						]
					});

					inviteElement.events.on("activated", _event => {
						globalThis.contents.close();
						globalThis.contents.open({ name: "room/index", parameters: { id: _event.data.room._id } });
					});
				}
			}

			if (invites.length > 0) _component.find("#waiting").classList.add("hide");
			else _component.find("#waiting").classList.remove("hide");

			if (scheduledUpdateTimer !== null)
				scheduledUpdateTimer = setTimeout(() => updateMyRooms(), 4000);
		};

		_component.events.on("disposed", () => {
			clearTimeout(scheduledUpdateTimer);
			scheduledUpdateTimer = 0;
		});

		updateMyRooms();
	}
};