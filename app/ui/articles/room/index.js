import anime from "/assets/scripts/anime.es.js";
import presence from "/components/presence.js";
import { component } from "/components/component.js";
import { button } from "/components/button.js";
import { tags } from "/components/tags.js";
import { handup } from "/components/handup.js";
import { react } from "/components/react.js";

export default {
	templates: () => {
		return {
			style: component.template`
				#head { position: relative; margin: calc(0px - var(--spacing)); margin-bottom: 0; }
				#head #container { display: grid; grid-gap: calc(var(--spacing) / 2); grid-template-columns: min-content auto; padding: var(--spacing); background: var(--paper-2); }
				#head #container #configure { padding: calc(var(--spacing) / 4); }
				#head #container #tags { grid-column: 1 / -1; }
			`,

			markup: component.template`
				<div id="head">
					<div id="container">
						<app-button id="configure" icon="cog" composition="icon" tiptext="Configure this room" embedded="true"></app-button>
						<h1></h1>
						<app-tags id="tags" fontsize="s" uppercase="true" composition="text" embedded="true"></app-tags>
					</div>
				</div>
			`
		};
	},

	script: async _component => {
		const roomResponse = await globalThis.fetcher(`/api/room/${_component.parameters.id}`, { method: "get" });

		if (roomResponse.status !== 200) {
			globalThis.notify([{ text: "We can't find the room you're trying to enter." }]).close(3000);
			globalThis.contents.close();
			return globalThis.contents.open({ name: "rooms/list" });
		}

		const room = await roomResponse.json();
		const roomOwner = (room.owner === globalThis.session.identity._id);
		const nameElement = _component.find("h1");
		nameElement.innerHTML = room.name;
		
		const tagsElement = _component.find("app-tags");
		if (room.tags) room.tags.forEach(_label => {
			tagsElement.add({ id: `item_${_label}`, text: `#${_label}` });
		});

		tagsElement.events.on("activated", async _id => {
			const search = async () => {
				globalThis.contents.close();
				globalThis.contents.open({ name: `rooms/search`, parameters: { name: "", labels: _id.replace("item_", "") } });
			}

			const remove = async () => {
				await globalThis.fetcher(`/api/room/tags/${room._id}/${_id.replace("item_", "")}`, {
					method: "delete"
				}, {
					200: _response => {
						tagsElement.find(_id).remove();
					}
				});
			}

			if (roomOwner && globalThis.keyboard.control)
				return remove();

			search();
		});

		tagsElement.events.on("saved", async _value => {
			await globalThis.fetcher(`/api/room/tags/${room._id}/${_value}`, {
				method: "post",
				body: JSON.stringify({

				})
			}, {
				201: _response => {
					tagsElement.add({ id: `item_${_value}`, text: `#${_value}` })
				}
			});
		});

		// Enable tag management if user owns the room.
		tagsElement.addable = roomOwner;

		// Create action button.
		const additionsElement = document.getElementById("additions");
		const actionElement = additionsElement.appendChild(new button({ id: "action", size: "large", icon: "hand-sparkles", composition: "icon", round: true }));
		actionElement.style.position = "fixed";
		actionElement.style.right = "calc(var(--spacing) / 2)";
		actionElement.style.bottom = "calc(var(--spacing) / 2)";
		actionElement.style.width = "60px";
		actionElement.style.height = "60px";
		actionElement.style.boxShadow = "var(--paper-s)";

		actionElement.events.on("activated", () => {
			actionElement.visible = false;

			globalThis.windows
				.open({
					name: "room/actions",
					parameters: { id: _component.parameters.id }
				}).events.on("closed", () => {
					actionElement.visible = true;
				});
		});

		_component.events.on("disposed", () => {
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

			// Roshambo

			"roshambo begins": _data => {
				globalThis.windows.list().forEach(_article => {
					if (_article.name === "roshambo/session/result")
						_article.close("closed");
				});

				globalThis.windows.close("room/actions");
				globalThis.windows.open({ name: "roshambo/session/cast", parameters: { session: _data } });
			},
			"roshambo ends": _data => {
				globalThis.windows.list().forEach(_article => {
					if (_article.name === "roshambo/session/cast" && _article.parameters.session === _data)
						_article.close("roshambo ended");
				});

				globalThis.windows.open({ name: "roshambo/session/result", parameters: { session: _data } });
			},

			// Voting

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
			presenceManager.leave();
		});

		// Show configure button if user owns the room.
		const configureElement = _component.find("#configure");
		configureElement.visible = roomOwner;
		configureElement.events.on("activated", () => {
			globalThis.contents.cut("room/index");
			globalThis.contents.open({ name: `room/configurations`, parameters: { room } });
		});

		// Open initial content.
		globalThis.contents.open({ name: `room/toolbox`, parameters: { room } });
		globalThis.contents.open({ name: `room/participants`, parameters: { room } });
	}
};