import { list } from "/components/list.js";

export default {
	styles: `
		#rooms-configurations { display: grid; grid-gap: 20px; }
	`,

	markup: `
		<div id="rooms-configurations">
			<h3 class="center">General configurations</h2>
			<app-list id="room-configurations-general" break="2"></app-list>

			<h3 class="center">Voting configurations</h2>
			<app-list id="room-configurations-voting"></app-list>
		</div>
	`,

	script: async _component => {
		// Close article if user isn't signed in.
		if (!localStorage.getItem("token")) return _component.close();

		// General.
		const generalElement = _component.use("room-configurations-general");

		// Enable room rename.
		(await generalElement.add({
			id: "general-rename",
			contents: [
				{ icon: "text" },
				{ text: "Rename this room" },
				{ arrow: true }
			]
		})).on("activated", async _event => {
			globalThis.windows.open({ name: "room-rename", parameters: _component.parameters }).once("renamed", _event => {
				globalThis.emit(`${_component.parameters.room._id} renamed`, _event.detail);
			});
		});

		// Enable room deletion.
		(await generalElement.add({
			id: "general-delete",
			contents: [
				{ icon: "minus" },
				{ text: "Delete this room" },
				{ arrow: true }
			]
		})).on("activated", async _event => {
			const deleteResponse = await globalThis.fetcher(`/api/room/${_component.parameters.room._id}`, {
				method: "delete"
			});

			if (deleteResponse.status >= 400) {
				const deleteContent = deleteResponse.json();
				globalThis.notify({ icon: "exclamation-circle", text: deleteContent.message });
			}
		});

		// Voting.
		const votingElement = _component.use("room-configurations-voting");

		// Enable configure templates.
		(await votingElement.add({
			id: "voting-templates",
			contents: [
				{ icon: "ballot" },
				{ text: "Configure voting templates" },
				{ arrow: true }
			]
		})).on("activated", async _event => {
			globalThis.windows.open({ name: "voting/configure/index", parameters: _component.parameters });
		});
	}
};