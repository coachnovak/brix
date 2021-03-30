import { component } from "/components/component.js";
import { list } from "/components/list.js";
import { textbox } from "/components/textbox.js";
import { button } from "/components/button.js";
import { ribbon } from "/components/ribbon.js";

export default {
	templates: () => {
		return {
			style: component.template`
				#layout { display: grid; grid-gap: var(--spacing); }
				app-button { width: unset; position: relative; left: 50%; transform: translateX(-50%); }
			`,
		
			markup: component.template`
				<div id="layout">
					<app-ribbon text="<h3>What would you like to do?</h3>"></app-ribbon>
					<app-list id="list"></app-list>
					<div id="actions">
						<app-button id="create" icon="plus" composition="icon" size="huge" embedded="true"></app-button>
					</div>
				</div>
			`
		};
	},

	script: async _component => {
		const roomsElement = _component.find("#list");

		const updateMyRooms = async () => {
			const roomsResponse = await globalThis.fetcher(`/api/rooms/`, { method: "get" });
			if (roomsResponse.status !== 200) return globalThis.contents.close("rooms");

			const rooms = await roomsResponse.json();
			for (let roomIndex = 0; roomIndex < rooms.length; roomIndex++) {
				const room = rooms[roomIndex];
				const name = `Join ${room.name}`;
				const count = `${room.participants} ${room.participants === 1 ? "participant" : "participants"}`;
				const existingRoom = roomsElement.find(`#room-${room._id}`);

				if (existingRoom) {
					existingRoom.find("#text").innerHTML = name;
					existingRoom.find("#count").innerHTML = count;
				} else {
					const roomElement = await roomsElement.add({
						id: `room-${room._id}`,
						data: room,
						contents: [
							{ icon: "booth-curtain" },
							{ text: name },
							{ count: count },
							{ arrow: true }
						]
					});

					roomElement.events.on("activated", _data => {
						globalThis.contents.close();
						globalThis.contents.open({ name: "room/index", parameters: { id: _data.data._id } });
					});
				}
			}

			_component.timers.once(() => updateMyRooms(), 4000);
		};

		_component.events.on("disposed", () => {
			globalThis.contents.close("my/invites");
		});

		globalThis.contents.open({ name: "my/invites" });
		await updateMyRooms();

		_component.find("#create").events.on("activated", _event => {
			globalThis.windows.open({ name: "room/create" }).events.on("created", _data => {
				globalThis.contents.close();
				globalThis.contents.open({ name: "room/index", parameters: { id: _data._id } });
			});
		});
	}
};