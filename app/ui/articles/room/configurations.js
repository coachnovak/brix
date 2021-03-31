import { component } from "/components/component.js";
import { list } from "/components/list.js";

export default {
	templates: () => {
		return {
			style: component.template`
				#layout { display: grid; grid-gap: 20px; }
			`,
		
			markup: component.template`
				<div id="layout">
					<h3 class="center">General</h2>
					<app-list id="general"></app-list>
		
					<h3 class="center">Voting</h2>
					<app-list id="voting"></app-list>
				</div>
			`
		};
	},

	script: async _component => {
		// General.
		const generalElement = _component.find("#general");

		// Enable room invitations.
		(await generalElement.add({
			id: "general-invitations",
			contents: [
				{ icon: "share-alt" },
				{ text: "Manage room invites" },
				{ arrow: true }
			]
		})).events.on("activated", async _event => {
			globalThis.windows.open({ name: "room/invites", parameters: _component.parameters });
		});

		// Enable room rename.
		(await generalElement.add({
			id: "general-rename",
			contents: [
				{ icon: "text" },
				{ text: "Rename the room" },
				{ arrow: true }
			]
		})).events.on("activated", async _event => {
			globalThis.windows.open({ name: "room/rename", parameters: _component.parameters }).events.on("renamed", _data => {
				globalThis.emit(`${_component.parameters.room._id} renamed`, _data);
			});
		});

		// Enable room deletion.
		(await generalElement.add({
			id: "general-delete",
			contents: [
				{ icon: "minus" },
				{ text: "Delete the room" },
				{ arrow: true }
			]
		})).events.on("activated", async _event => {
			const deleteResponse = await globalThis.fetcher(`/api/room/${_component.parameters.room._id}`, {
				method: "delete"
			});

			if (deleteResponse.status >= 400) {
				const deleteContent = deleteResponse.json();
				globalThis.notify([{ icon: "exclamation-circle" }, { text: deleteContent.message }]).close(3000);
			}
		});

		// Voting.
		const votingElement = _component.find("#voting");

		// Enable configure templates.
		(await votingElement.add({
			id: "voting-templates",
			contents: [
				{ icon: "ballot" },
				{ text: "Configure voting templates" },
				{ arrow: true }
			]
		})).events.on("activated", async _event => {
			globalThis.windows.open({ name: "voting/configure/index", parameters: _component.parameters });
		});
	}
};