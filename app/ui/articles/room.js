import { button } from "/components/button.js";
import socket from "/components/socket.js";

export default {
	styles: `
		.room.container { display: grid; grid-template-columns: auto; grid-gap: 20px; }

		.room.container .profile { width: 100%; overflow: hidden; text-align: center; }
		.room.container .profile .name { font-size: 18pt; font-weight: 100; margin: 0; margin-bottom: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%; }

		.room.container .profile .status { display: inline-block; font-size: 8pt; margin: 0; text-transform: uppercase; }
		.room.container .profile .status { opacity: 0.5; }
		.room.container .profile .status.connected { display: none; }
	`,

	markup: `
		<div class="room container">
			<div class="profile">
				<div id="roomName" class="name"></div>
				<div id="roomStatus" class="status"></div>
			</div>
		</div>
	`,

	script: async _component => {
		// Close article if user isn't signed in.
		if (!localStorage.getItem("token")) return globalThis.article.close("room");

		const nameElement = _component.use("roomName");
		const statusElement = _component.use("roomStatus");

		// Get room
		const roomResponse = await globalThis.fetcher(`/api/room/${_component.parameters.alias}`, { method: "get" });

		if (roomResponse.status !== 200) {
			globalThis.notify({ text: "We can't find the room you're trying to enter." })
			return globalThis.article.open([{ name: "rooms" }], { reset: true });
		}

		const room = await roomResponse.json();
		nameElement.innerHTML = room.name;
		statusElement.innerHTML = "Connecting";

		// Connect to stream
		const stream = new socket("room");
		let scheduledHeartbeatTimer = -1;
		let scheduledPokeTimer = -1;

		const heartbeat = async () => {
			stream.send("heartbeat");
			scheduledHeartbeatTimer = setTimeout(() => heartbeat(), 2000);
		}

		const newEstimateWork = _event => {
			globalThis.article.cut("reactions");

			globalThis.article.open([
				{
					name: "room-back",
					parameters: {
						cut: "reactions",
						open: { name: "collaboration", parameters: { room, stream } }
					}
				},
				{
					name: "estimate-effort-turn",
					parameters: {
						room,
						stream,
						by: `${_event.detail.user.firstName} ${_event.detail.user.lastName}`,
						when: _event.detail.when,
						options: _event.detail.data.options,
						turnid: _event.detail.data.turnid
					}
				}, {
					name: "estimate-effort-result",
					parameters: {
						room,
						stream,
						by: `${_event.detail.user.firstName} ${_event.detail.user.lastName}`,
						when: _event.detail.when,
						options: _event.detail.data.options,
						turnid: _event.detail.data.turnid
					}
				}
			]);
		}

		const poke = async _event => {
			const contentsElement = document.body; //document.getElementById("contents");
			const identityElement = document.getElementById("identity");
			if (identityElement.user && _event.detail.data._id !== identityElement.user._id) return;

			contentsElement.classList.add("shake-hard", "shake-constant");
			scheduledPokeTimer = setTimeout(() => {
				contentsElement.classList.remove("shake-hard", "shake-constant");
				globalThis.notify({ icon: "hand-point-up", text: "Someone poked you - guess who! 😜" });
			}, 500);
		}

		stream.on("open", async () => {
			stream.send("setup", { room: room._id });
			statusElement.innerHTML = "Connected";
			statusElement.classList.add("connected");
		});

		stream.on("close", async () => {
			statusElement.innerHTML = "Reconnecting";
			statusElement.classList.remove("connected");
			clearTimeout(scheduledHeartbeatTimer);
		});

		stream.on("message", async (_message) => {
			const message = JSON.parse(_message.data);
			globalThis.emit(message.name, message);
		});

		stream.connect();

		_component.on("disposing", () => {
			stream.close(true);

			globalThis.off("ready", heartbeat);
			globalThis.off("new-estimate-work", newEstimateWork);
			globalThis.off("poke", poke);
		});

		globalThis.article.open([
			{ name: "reactions", parameters: { room, stream } },
			{ name: "collaboration", parameters: { room, stream } }
		]);

		globalThis.on("ready", heartbeat);
		globalThis.on("new-estimate-work", newEstimateWork);
		globalThis.on("poke", poke);
	}
};