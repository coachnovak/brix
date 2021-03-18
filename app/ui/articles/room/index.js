import { tabs } from "/components/tabs.js";
import presence from "/components/presence.js";

export default {
	styles: `

	`,

	markup: `
		<app-tabs id="room-tabs"></app-tabs>
	`,

	script: async _component => {
		// Close article if user isn't signed in.
		if (!localStorage.getItem("token")) return _component.close();

		const roomResponse = await globalThis.fetcher(`/api/room/${_component.parameters.id}`, { method: "get" });

		if (roomResponse.status !== 200) {
			globalThis.notify({ text: "We can't find the room you're trying to enter." })
			globalThis.contents.close();
			return globalThis.contents.open({ name: "rooms" });
		}

		const room = await roomResponse.json();

		const nameElement = document.querySelector("header > h1");
		const originalName = nameElement.innerHTML;
		nameElement.innerHTML = room.name;

		// Create user presence.
		const presenceManager = new presence(room._id);

		// Subscribe to room events.
		const unsubscribeFromRoom = globalThis.stream.subscribe(`all-room-${room._id}`, {
			"joined": _data => {
				globalThis.notify({ icon: "info-circle", text: `${_data.user.firstName} ${_data.user.lastName} joined the room.` });
			},
			"renamed": _data => {
				room.name = _data.newName;
				nameElement.innerHTML = _data.newName;
			},
			"deleted": _data => {
				globalThis.notify({ icon: "info-circle", text: `Room "${room.name}" was deleted.` });
				document.getElementById("button.home").emit("activated");
			}
		});

		const unsubscribeFromPersonal = globalThis.stream.subscribe(`{user}-room-${room._id}`, {
			"poke": _data => {
				const contentsElement = document.body;
				contentsElement.classList.add("shake-hard", "shake-constant");

				setTimeout(() => {
					if (contentsElement) contentsElement.classList.remove("shake-hard", "shake-constant");
					globalThis.notify({ icon: "hand-point-up", text: "Poke! Poke! 😜" });
				}, 300);
			},
			"voting begins": _data => {
				globalThis.windows.list().forEach(_article => {
					if (_article.name === "voting/session/result")
						_article.close("closed");
				});

				globalThis.windows.open({ name: "voting/session/cast", parameters: { session: _data } });
			},
			"voting progress": _data => {
				globalThis.windows.open({ name: "voting/session/progress", parameters: { session: _data } });
			},
			"voting ends": _data => {
				globalThis.windows.list().forEach(_article => {
					if (_article.name === "voting/session/cast" && _article.parameters.session === _data)
						_article.close("voting ended");
				});

				globalThis.windows.open({ name: "voting/session/result", parameters: { session: _data } });
			}
		});

		_component.on("disposing", () => {
			// Reset element content.
			nameElement.innerHTML = originalName;

			// Unsubscribe from events.
			unsubscribeFromRoom();
			unsubscribeFromPersonal();

			// Leave this room.
			presenceManager.leave()
		});

		const tabsElement = _component.use("room-tabs");

		tabsElement.on("selected", () => {
			globalThis.contents.cut("room/index");
			globalThis.contents.open({ name: tabsElement.selected, parameters: { room } });
		});

		tabsElement.add("room/participants", { icon: "users", composition: "icon" });
		tabsElement.add("room/toolbox", { icon: "toolbox", composition: "icon" });

		// Show admin tabs if user owns the room.
		const currentUserId = document.getElementById("identity").user._id;
		if (room.owner === currentUserId)
			tabsElement.add("room/configurations", { icon: "cog", composition: "icon" });
	}
};