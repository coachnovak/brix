import { button } from "/components/button.js";
import socket from "/components/socket.js";

export default {
	styles: `
		#room-profile-name { font-size: 18pt; font-weight: 100; line-height: 110%; margin: 0; margin-bottom: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%; }
		#room-profile-status { font-size: 8pt; margin: 0; text-transform: uppercase; opacity: 0.5; }
		#room-profile-status.connected { display: none; }
	`,

	markup: `
		<div id="room-profile-name" class="center"></div>
		<div id="room-profile-status" class="center"></div>
	`,

	script: async _component => {
		// Close article if user isn't signed in.
		if (!localStorage.getItem("token")) return _component.close();

		const nameElement = _component.use("room-profile-name");
		const statusElement = _component.use("room-profile-status");
		const roomResponse = await globalThis.fetcher(`/api/room/${_component.parameters.id || _component.parameters.alias}`, { method: "get" });

		if (roomResponse.status !== 200) {
			globalThis.notify({ text: "We can't find the room you're trying to enter." })
			globalThis.contents.close();
			return globalThis.contents.open({ name: "rooms" });
		}

		const room = await roomResponse.json();
		nameElement.innerHTML = room.name;
		statusElement.innerHTML = "Connecting";

		// Connect to stream
		const stream = new socket("room");
		let scheduledHeartbeatTimer = -1;
		let scheduledPokeTimer = -1;

		const renamed = async _event => {
			nameElement.innerHTML = _event.detail.name;
		}

		const heartbeat = async () => {
			stream.send("heartbeat");
			scheduledHeartbeatTimer = setTimeout(() => heartbeat(), 2000);
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

		const newEffortEstimate = async _event => {
			const parametersToUse = {
				room,
				stream,
				by: _event.detail.data.by,
				when: _event.detail.data.when,
				options: _event.detail.data.options,
				turnid: _event.detail.data.turnid
			};

			globalThis.windows.open({
				name: "estimate-effort-result",
				parameters: parametersToUse
			});

			globalThis.windows.open({
				name: "estimate-effort-turn",
				parameters: parametersToUse
			});
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

			globalThis.off(`new-estimate-effort`, newEffortEstimate);
			globalThis.off(`${room._id} renamed`, renamed);
			globalThis.off("ready", heartbeat);
			globalThis.off("poke", poke);
		});

		// globalThis.contents.open({ name: "reactions", parameters: { room, stream } });
		// globalThis.contents.open({ name: "collaboration", parameters: { room, stream } });
		globalThis.contents.open({ name: "room-views", parameters: { room, stream } });

		globalThis.on(`new-estimate-effort`, newEffortEstimate);
		globalThis.on(`${room._id} renamed`, renamed);
		globalThis.on("ready", heartbeat);
		globalThis.on("poke", poke);
	}
};