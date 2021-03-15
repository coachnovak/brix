import { list } from "/components/list.js";
import { textbox } from "/components/textbox.js";
import { button } from "/components/button.js";

export default {
	styles: `
		#rooms-head { margin-bottom: 20px; }
	`,

	markup: `
		<div id="rooms">
			<div id="rooms-head" class="center">
				<h2>What would you like to do?</h2>
			</div>

			<div id="rooms-select">
				<app-list id="rooms-list"></app-list>
			</div>
		</div>
	`,

	script: async _component => {
		const roomsElement = _component.use("rooms-list");
		let scheduledUpdateTimer = null;

		const updateMyRooms = async () => {
			// Close article if user isn't signed in.
			if (!localStorage.getItem("token")) return _component.close();

			const roomsResponse = await globalThis.fetcher(`/api/rooms/`, { method: "get" });
			if (roomsResponse.status !== 200) return globalThis.contents.close("rooms");

			const rooms = await roomsResponse.json();
			for (let roomIndex = 0; roomIndex < rooms.length; roomIndex++) {
				const existingRoom = roomsElement.use(rooms[roomIndex]._id);
				const room = rooms[roomIndex];
				const name = `Join ${room.name}`;
				const count = `${room.participants} ${room.participants === 1 ? "participant" : "participants"}`;

				if (existingRoom) {
					existingRoom.use("text").innerHTML = name;
					existingRoom.use("count").innerHTML = count;
				} else {
					const roomElement = await roomsElement.add({
						id: room._id,
						data: room,
						contents: [
							{ icon: "booth-curtain" },
							{ text: name },
							{ count: count },
							{ arrow: true }
						]
					});

					roomElement.on("activated", _event => {
						globalThis.contents.close();
						globalThis.contents.open({ name: "room", parameters: { id: _event.detail._id } });
					});
				}
			}

			scheduledUpdateTimer = setTimeout(() => updateMyRooms(), 4000);
		};

		_component.on("disposing", () => {
			globalThis.contents.close("my-invites");
			clearTimeout(scheduledUpdateTimer);
		});

		globalThis.contents.open({ name: "my-invites" });
		await updateMyRooms();

		const createElement = await roomsElement.add({
			id: "create",
			contents: [
				{ icon: "sparkles" },
				{ text: "Create a room" },
				{ arrow: true }
			]
		});

		createElement.on("activated", _event => {
			globalThis.windows.open({ name: "room-create" }).once("created", _event => {
				globalThis.contents.close();
				globalThis.contents.open({ name: "room", parameters: { id: _event.detail._id } });
			});
		});
	}
};