import anime from "/assets/scripts/anime.es.js";
import presence from "/components/presence.js";
import { component } from "/components/component.js";
import { tabs } from "/components/tabs.js";
import { button } from "/components/button.js";
import { handup } from "/components/handup.js";
import { react } from "/components/react.js";

export default {
	templates: () => {
		return {
			style: component.template`
				#head { position: relative; left: calc(0px - var(--spacing)); top: calc(0px - var(--spacing)); width: calc(100% + (var(--spacing) * 2)); height: 140px; }
				#head { background: var(--paper-2); display: grid; grid-gap: var(--spacing); padding: calc(var(--spacing) * 1.5); }
			`,
		
			markup: component.template`
				<div id="head">
					<h1 id="name"></h1>
				</div>

				<app-tabs id="views"></app-tabs>
			`
		};
	},

	script: async _component => {
		const roomResponse = await globalThis.fetcher(`/api/room/${_component.parameters.id}`, { method: "get" });

		if (roomResponse.status !== 200) {
			globalThis.notify([{ text: "We can't find the room you're trying to enter." }]).close(3000);
			globalThis.contents.close();
			return globalThis.contents.open({ name: "rooms" });
		}

		const room = await roomResponse.json();
		const nameElement = _component.find("#name");
		nameElement.innerHTML = room.name;

		// Create action button.
		const additionsElement = document.getElementById("additions");
		const actionElement = additionsElement.appendChild(new button({ id: "room-action", size: "huge", icon: "hand-sparkles", composition: "icon" }));
		actionElement.style.position = "fixed";
		actionElement.style.right = "0";
		actionElement.style.top = "50vh";
		actionElement.style.opacity = 0.85;
		actionElement.style.width = "65px";
		actionElement.style.height = "65px";
		actionElement.style.borderRadius = "50%";
		actionElement.style.transform = "translate(5px, -50%)";

		const actionAnimation = anime({ targets: actionElement, duration: 1200, translateX: () => `${anime.random(-15, -120)}px`, direction: "alternate", easing: "easeInBounce", loop: true });
		const actionAnimationToggle = anime({ targets: actionElement, duration: 600, translateX: "100px", easing: "easeInBounce", autoplay: false, loop: false });

		actionElement.events.on("activated", () => {
			actionAnimation.pause();
			actionAnimationToggle.seek(0);
			actionAnimationToggle.play();

			globalThis.windows
				.open({
					name: "room/actions",
					parameters: { id: _component.parameters.id }
				}).events.on("closed", () => {
					actionAnimationToggle.reverse();
					actionAnimationToggle.play();
					setTimeout(() => actionAnimation.seek(0) & actionAnimation.play(), 600);
				});
		});

		_component.events.on("disposed", () => {
			actionAnimation.pause();
			actionAnimation.remove(actionElement);

			actionAnimationToggle.pause();
			actionAnimationToggle.remove(actionElement);

			actionElement.remove();
		});

		// Create user presence.
		const presenceManager = new presence(room._id);

		// Subscribe to room events.
		const unsubscribeFromRoom = globalThis.stream.subscribe(`all-room-${room._id}`, {
			// Happenings

			"joined": _data => {
				globalThis.notify([{ icon: "info-circle" }, { text: `${_data.user.firstName} ${_data.user.lastName} joined the room.` }]).close(3000);
			},
			"renamed": _data => {
				room.name = _data.newName;
				nameElement.innerHTML = _data.newName;
			},
			"deleted": _data => {
				globalThis.notify([{ icon: "info-circle" }, { text: `Room "${room.name}" was deleted.` }]).close(3000);
				document.getElementById("home").events.emit("activated");
			},

			// Actions

			"handup": _data => {
				const { doer, position, meta } = _data;
				const display = `${meta.firstName} ${meta.lastName}`;

				const foundHandupElement = Array.from(document.body.querySelectorAll("app-handup")).find(_element => _element.doer === doer);
				if (foundHandupElement) foundHandupElement.raise();
				else document.body.appendChild(new handup({ doer, display, position }));
			},
			"react": _data => {
				const { position, reaction, meta } = _data;
				const display = `${meta.firstName} ${meta.lastName}`;

				const reactElement = new react({ position, reaction, display });
				document.body.appendChild(reactElement);
			}
		});

		const unsubscribeFromPersonal = globalThis.stream.subscribe(`{user}-room-${room._id}`, {
			"poke": _data => {
				const contentsElement = document.body;
				contentsElement.classList.add("shake-hard", "shake-constant");

				setTimeout(() => {
					if (contentsElement) contentsElement.classList.remove("shake-hard", "shake-constant");
					globalThis.notify([{ icon: "hand-point-up" }, { text: "Poke! Poke! 😜" }]).close(3000);
				}, 300);
			},
			"voting begins": _data => {
				globalThis.windows.list().forEach(_article => {
					if (_article.name === "voting/session/result")
						_article.close("closed");
				});

				globalThis.windows.close("room/actions");
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

		_component.events.on("disposed", () => {
			// Unsubscribe from events.
			unsubscribeFromRoom();
			unsubscribeFromPersonal();

			// Leave this room.
			presenceManager.leave()
		});

		const tabsElement = _component.find("#views");
		tabsElement.events.on("selected", () => {
			globalThis.contents.cut("room/index");
			globalThis.contents.open({ name: `room/${tabsElement.selected}`, parameters: { room } });
		});

		tabsElement.add("participants", { icon: "users", composition: "icon", tiptext: "Participants", tipplacement: "bottom" });
		tabsElement.add("toolbox", { icon: "toolbox", composition: "icon", tiptext: "Toolbox", tipplacement: "bottom" });

		// Show admin tabs if user owns the room.
		if (room.owner === globalThis.session.identity._id)
			tabsElement.add("configurations", { icon: "cog", composition: "icon", tiptext: "Configurations", tipplacement: "bottom" });
	}
};