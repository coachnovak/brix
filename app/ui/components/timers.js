export default class {
	constructor () {
		this.registry = [];
	}

	once (_at, _do) {
		const handle = setTimeout(_do, _at);
		const stop = () => clearTimeout(handle);

		this.registry.push({ once: handle });
		return stop;
	}

	repeat (_at, _do) {
		const handle = setInterval(_do, _at);
		const stop = () => clearInterval(handle);

		this.registry.push({ repeat: handle });
		return stop;
	}

	clear () {
		this.registry.forEach(_handle => {
			if (_handle.once) clearTimeout(_handle.once);
			if (_handle.repeat) clearInterval(_handle.repeat);
		});
	}
}