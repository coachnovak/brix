export default class {
	subscriptions = [];

	constructor () {
		this.socket = null;
		this.sleep = 2000;
		this.abandoned = false;

		const protocol = window.location.protocol;
		const host = window.location.host.split(":");
		this.url = `${protocol === "https:" ? "wss" : "ws"}://${host.join(":")}/sck/stream/`
		this.connect();
	}

	async connected () {
		this.subscriptions.forEach(_subscription => this.socket.send(JSON.stringify({ channel: _subscription.channel })));
	}

	async disconnected () {
		setTimeout(() => this.reconnect(), this.sleep);
	}

	async error () {
		this.close();
	}

	async message (_message) {
		const { channel, message } = JSON.parse(_message.data);

		// Find channel subscription.
		this.subscriptions.forEach(_subscription => {
			// Match channel and ensure there's a matching event by name.
			if (_subscription.channel === channel && _subscription.events[message.name]) {
				// Emit event with or without data.
				if (message.data === undefined) _subscription.events[message.name]();
				else _subscription.events[message.name](message.data);
			}
		});
	}

	subscribe (channel, events) {
		// If no connection is ready, terminate request.
		if (this.socket.readyState !== 1) return null;

		// Provide token if available.
		const token = localStorage.getItem("token");

		// Send subscription request.
		this.socket.send(JSON.stringify({ channel, token }));

		// Register subscription.
		const user = document.getElementById("identity").user
		if (user) channel = channel.replace("{user}", user._id);

		this.subscriptions.push({ channel, events });

		// Return unsubscribe option.
		return () => {
			const subscriptionIndex = this.subscriptions.findIndex(_subscription => _subscription.channel === channel);
			if (subscriptionIndex > -1) this.subscriptions.splice(subscriptionIndex, 1);

			this.socket.send(JSON.stringify({ channel }));
		};
	}

	reconnect () {
		if (this.abandoned) return;
		this.close(); this.connect();
	}

	connect () {
		this.socket = new WebSocket(this.url);
		this.socket.onopen = _info => this.connected(_info);
		this.socket.onclose = _info => this.disconnected(_info);
		this.socket.onerror = _info => this.error(_info);
		this.socket.onmessage = _info => this.message(_info);
	}

	close (_abandon) {
		if (_abandon) this.abandon();
		this.socket.close();
	}

	abandon () {
		this.abandoned = true;
	}
}