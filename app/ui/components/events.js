export default class {
	constructor () {
		this.registry = {};
	}

	async on (_name, _listener) {
		if (!this.registry[_name]) this.registry[_name] = [];
		this.registry[_name].push(_listener);
	}

	async off (_name, _listener) {
		if (!this.registry[_name]) return;
		this.registry[_name] = this.registry[_name].filter(_listenerInRegistry => _listenerInRegistry !== _listener);
	}

	async emit (_name, _data) {
		if (!this.registry[_name]) return;
		this.registry[_name].forEach(async _listener => _listener(_data));
	}

	async clear () {
		for (const key in this.registry)
			this.registry[key] = [];
	}
}