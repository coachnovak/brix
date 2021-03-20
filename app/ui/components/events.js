export default class {
	constructor () {
		this.registry = {};
	}

	on (_name, _listener) {
		if (!this.registry[_name]) this.registry[_name] = [];
		this.registry[_name].push(_listener);
		return this;
	}

	off (_name, _listener) {
		if (!this.registry[_name]) return;
		this.registry[_name] = this.registry[_name].filter(_listenerInRegistry => _listenerInRegistry !== _listener);
		return this;
	}

	async emit (_name, _data) {
		if (!this.registry[_name]) return;
		this.registry[_name].forEach(async _listener => _listener(_data));
	}

	clear () {
		for (const key in this.registry)
			this.registry[key] = [];
	}
}