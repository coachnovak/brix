import { component } from "/components/component.js";
import { list } from "/components/list.js";
import { label } from "/components/label.js";

export default {
	templates: () => {
		return {
			style: component.template`
				#layout { display: grid; grid-gap: var(--spacing); }
				app-label { display: inline-block; }
			`,
		
			markup: component.template`
				<div id="layout">
					<h2>Similar rooms</h2>
					<app-label casing="upper"></app-label>
					<app-list></app-list>
				</div>
			`
		};
	},

	script: async _component => {
		let searchFor = {};
		let searchDisplay = [];

		searchFor.name = _component.parameters.name;
		searchFor.labels = _component.parameters.labels.split(" ");

		if (searchFor.name.length > 0) searchDisplay.push(searchFor.name);
		if (searchFor.labels.length > 0) searchDisplay.push(searchFor.labels.map(_label => `#${_label}`).join(" or "));

		const labelElement = _component.find("app-label");
		labelElement.text = searchDisplay.join(" and ");
	
		const roomsElement = _component.find("app-list");
		await globalThis.fetcher(`/api/rooms/search/`, {
			method: "post",
			body: JSON.stringify(searchFor)
		}, {
			200: async _response => {
				const rooms = await _response.json();
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
			}
		});
	}
};