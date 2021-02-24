import { list } from "/components/list.js";

export default {
	styles: `
		#room-configurations-list { display: block; }
		#room-configurations-list .empty { padding: 20px; text-align: center; }
	`,

	markup: `
		<div id="rooms-configurations-actions">
			<app-list id="room-configurations-actions-list" break="2"></app-list>
		</div>
	`,

	script: async _component => {
		// Close article if user isn't signed in.
		if (!localStorage.getItem("token")) return _component.close();

		const actionsListElement = _component.use("room-configurations-actions-list");

		// Enable room rename.
		(await actionsListElement.add({
			id: "rename",
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
		(await actionsListElement.add({
			id: "delete",
			contents: [
				{ icon: "minus" },
				{ text: "Delete this room" },
				{ arrow: true }
			]
		})).on("activated", async _event => {
			const deleteResponse = await globalThis.fetcher(`/api/room/${_component.parameters.room._id}`, {
				method: "delete"
			});

			if (deleteResponse.status === 200) {
				globalThis.contents.close();
				globalThis.contents.open({ name: "rooms" });
				globalThis.notify({ icon: "info-circle", text: "Room was deleted." });
			} else if (createResponse.status >= 400) {
				globalThis.notify({ icon: "exclamation-circle", text: createContent.message });
			}
		});
	}
};