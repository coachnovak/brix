export default class {
	constructor () {
		this.control = false;
		this.shift = false;

		globalThis.events.on(["keydown", "keyup"], _event => {
			this.control = _event.ctrlKey;
			this.shift = _event.shiftKey;
		});
	}
}