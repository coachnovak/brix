export default {
	styles: `
		#room-back-list { display: block; text-align: center; }
	`,

	markup: `
		<app-list id="room-back-list"></app-list>
	`,

	script: async _component => {
		const listElement = _component.use("room-back-list");

		const gobackElement = await listElement.add({
			id: "goback",
			contents: [
				{ icon: "arrow-left" },
				{ text: "Go back" },
				{ arrow: true },
			]
		});

		gobackElement.on("activated", _event => {
			if (_component.parameters.cut) globalThis.content.cut(_component.parameters.cut);
			if (_component.parameters.close) globalThis.content.open(_component.parameters.close);
			if (_component.parameters.open) globalThis.content.open(_component.parameters.open);
		});
	}
};