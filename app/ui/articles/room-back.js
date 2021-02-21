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
			if (_component.parameters.cut) globalThis.contents.cut(_component.parameters.cut);
			if (_component.parameters.close) globalThis.contents.open(_component.parameters.close);
			if (_component.parameters.open) globalThis.contents.open(_component.parameters.open);
		});
	}
};