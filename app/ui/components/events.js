export default class {
	constructor () {
		this.registry = {};
		this.redirects = [];
	}

	on (_names, _listener) {
		const register = _name => {
			if (!this.registry[_name]) this.registry[_name] = [];
			this.registry[_name].push(_listener);
		};

		if (_names instanceof Array) _names.forEach(_name => register(_name));
		else register(_names);

		return this;
	}

	off (_names, _listener) {
		const unregister = _name => {
			if (!this.registry[_name]) return;
			this.registry[_name] = this.registry[_name].filter(_listenerInRegistry => _listenerInRegistry !== _listener);
		};

		if (_names instanceof Array) _names.forEach(_name => unregister(_name));
		else unregister(_names);

		return this;
	}

	async emit (_name, _data) {
		if (!this.registry[_name]) return;
		for (let listenerIndex = 0; listenerIndex < this.registry[_name].length; listenerIndex++) {
			const listener = this.registry[_name][listenerIndex];
			const isasync = listener.constructor.name === "AsyncFunction";

			if (!isasync) listener(_data);
			else await listener(_data);
		}
	}

	redirect (_element, _name, _to) {
		const redirect = {
			element: _element,
			name: _name,
			listener: _event => {
				this.emit(_to || _name, _event);
			}
		};

		_element.addEventListener(_name, redirect.listener);
		this.redirects.push(redirect);
	}

	clear () {
		// Clear registry.
		for (const key in this.registry)
			this.registry[key] = [];

		// Clear redirects.
		this.redirects.forEach(_redirect => {
			_redirect.element.removeEventListener(_redirect.name, _redirect.listener)
		});
	}
}