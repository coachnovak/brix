import { list } from "/components/list.js";
import { textbox } from "/components/textbox.js";
import { button } from "/components/button.js";

export default {
	styles: `
		#rooms-head { margin-bottom: 20px; text-align: center; }
		#rooms app-list { display: block; }

		#rooms-waiting { text-align: center; }
		#rooms-waiting.hide { display: none; }
		#rooms-list { margin-bottom: 20px; }
		#rooms-select { margin-bottom: 20px; }

		#rooms-custom { display: grid; grid-gap: 20px; grid-template-columns: auto; }
		#rooms-custom .divider { grid-column: 1 / -1; }

		@media all and (min-width: 456px) {
			#rooms-custom { grid-template-columns: auto min-content; }
		}
	`,

	markup: `
		<div id="rooms" class="rooms container">
			<div id="rooms-head">
				<h2>What would you like to do?</h2>
			</div>

			<div id="rooms-waiting">
				No rooms created, yet.
			</div>

			<div id="rooms-select">
				<app-list id="rooms-list" break="3"></app-list>
				<div class="divider"><span>or</span></div>
			</div>

			<div id="rooms-custom">
				<app-textbox type="textbox" id="rooms-join-alias" center="true" placeholder="Room alias"></app-textbox>
				<app-button id="rooms-join-do" text="Join room" icon="person-booth" composition="text icon"></app-button>

				<div class="divider"><span>or</span></div>

				<app-textbox type="textbox" id="rooms-create-name" center="true" placeholder="Room name"></app-textbox>
				<app-button id="rooms-create-do" text="Create room" icon="plus" composition="text icon"></app-button>
			</div>
		</div>
	`,

	script: async _component => {
		let scheduledUpdateTimer = null;

		const updateMyRooms = async () => {
			// Close article if user isn't signed in.
			if (!localStorage.getItem("token")) return globalThis.contents.close("rooms");

			const roomsElement = _component.use("rooms-list");
			const roomsResponse = await globalThis.fetcher(`/api/rooms/`, { method: "get" });
			if (roomsResponse.status !== 200) return globalThis.contents.close("rooms");

			const rooms = await roomsResponse.json();
			for (let roomIndex = 0; roomIndex < rooms.length; roomIndex++) {
				const existingRoom = roomsElement.use(rooms[roomIndex]._id);
				const room = rooms[roomIndex];
				const name = `Join ${room.name}`;
				const count = `${room.participants}`;

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
						globalThis.contents.open({ name: "room", parameters: { alias: _event.detail.alias } });
					});
				}
			}

			if (rooms.length > 0) _component.use("rooms-waiting").classList.add("hide");
			else _component.use("rooms-waiting").classList.remove("hide");

			scheduledUpdateTimer = setTimeout(() => updateMyRooms(), 4000);
		};

		const joinAliasElement = _component.use("rooms-join-alias");
		const joinDoElement = _component.use("rooms-join-do");

		joinAliasElement.on("activated", async () => {
			joinDoElement.emit("activated");
		});

		joinDoElement.on("activated", async () => {
			const aliasValid = /^[a-zA-Z0-9]{10}$/.test(joinAliasElement.value());
			if (!aliasValid) return;

			globalThis.contents.close();
			if (localStorage.getItem("token")) globalThis.contents.open({ name: "room", parameters: { alias: joinAliasElement.value() } });
			else globalThis.contents.open({ name: "signin" });
		});

		const prefillAlias = () => {
			joinAliasElement.on("ready", () => {
				const hash = globalThis.location.hash;
				if (hash !== "") joinAliasElement.value(hash.substring("1"))
			});
		}

		const createNameElement = _component.use("rooms-create-name");
		const createDoElement = _component.use("rooms-create-do");

		createNameElement.on("activated", async () => {
			createDoElement.emit("activated");
		});

		createDoElement.on("activated", async () => {
			const nameValid = /^[a-zA-Z0-9 _]{1,20}$/.test(createNameElement.value());
			if (!nameValid) return;

			const roomResponse = await globalThis.fetcher(`/api/room/`, {
				method: "post",
				body: JSON.stringify({ name: createNameElement.value() })
			});

			if (roomResponse.status === 201) {
				const room = await roomResponse.json();
				globalThis.contents.close();
				globalThis.contents.open({ name: "room", parameters: { alias: room.alias } });
			}
		});

		_component.on("disposing", () => {
			clearTimeout(scheduledUpdateTimer);
		});

		prefillAlias();
		updateMyRooms();
	}
};