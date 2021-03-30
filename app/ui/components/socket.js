export default class {
	listeners = [];

	constructor (_url) {
		this.socket = null;
		this.sleep = 3000;
		this.abandoned = false;

		const protocol = window.location.protocol;
		const host = window.location.host.split(":");
		// if (host.length > 1) host[host.length - 1] = parseInt(host[host.length - 1]) + 1;
		// else host.push("81");
		this.url = `${protocol === "https:" ? "wss" : "ws"}://${host.join(":")}/sck/${_url}/`

		this.on("close", () => setTimeout(() => this.reconnect(), this.sleep));
		this.on("error", () => this.close());
	}

	on (_event, _function) {
		this.listeners.push({
			event: _event,
			function: _function
		});
	}

	emit (_event, _info) {
		this.listeners.forEach(_listener => {
			if (_listener.event === _event)
				_listener.function(_info);
		});
	}

	send (_name, _data) {
		if (this.socket.readyState === 1)
			this.socket.send(JSON.stringify({
				token: globalThis.session.token,
				name: _name,
				data: _data
			}));
	}

	sendJson (_message) {
		if (this.socket.readyState === 1)
			this.socket.send(JSON.stringify(_message));
	}

	reconnect () {
		if (this.abandoned) return;
		console.log("Reconnecting");

		this.close();
		this.connect();
	}

	connect () {
		this.socket = new WebSocket(this.url)
		this.socket.onopen = _info => this.emit("open", _info);
		this.socket.onclose = _info => this.emit("close", _info);
		this.socket.onerror = _info => this.emit("error", _info);
		this.socket.onmessage = _info => this.emit("message", _info);
	}

	close (_abandon) {
		if (_abandon)
			this.abandon();

		this.socket.close();
	}

	abandon () {
		this.abandoned = true;
	}
}