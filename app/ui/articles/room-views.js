import { tabs } from "/components/tabs.js";

export default {
	styles: `

	`,

	markup: `
		<app-tabs id="room-views-tabs"></app-tabs>
	`,

	script: async _component => {
		const tabsElement = _component.use("room-views-tabs");

		tabsElement.on("selected", () => {
			globalThis.contents.cut("room-views");
			globalThis.contents.open({ name: tabsElement.selected, parameters: _component.parameters });
		});

		tabsElement.on("ready", () => {
			tabsElement.add("room-discussion", { icon: "comments-alt", composition: "icon" });
			tabsElement.add("room-participants", { icon: "users", composition: "icon" });
			tabsElement.add("room-toolbox", { icon: "toolbox", composition: "icon" });
			tabsElement.add("room-history", { icon: "history", composition: "icon" });

			// Show admin tabs if user owns the room.
			const currentUserId = document.getElementById("identity").user._id;
			if (_component.parameters.room.owner === currentUserId)
				tabsElement.add("room-configurations", { icon: "cog", composition: "icon" });
		});
	}
};