export default async (_app, _options) => {
	_app.get("/", {
		websocket: true
	}, async (_connection, _request) => {
		const subscriptions = [];
		const respond = (channel, message) => _connection.socket.send(JSON.stringify({ channel, message }));
		const receive = (channel, message) => respond(channel, message);

		_connection.socket.on("message", async _message => {
			const message = JSON.parse(_message);
			const token = message?.token ?? null;

			if (token) {
				const session = await _request.jwtVerify({ extractToken: _request => message?.token });
				if (!session.user) return;

				message.channel = message.channel.replace("{user}", session.user);
			}

			// Find existing subscription. 
			const subscriptionIndex = subscriptions.findIndex(_subscription => _subscription.channel === message.channel);

			if (subscriptionIndex > -1) {
				subscriptions[subscriptionIndex].unsubscribe();
				subscriptions.splice(subscriptionIndex, 1);
				respond(message.channel, { name: "unsubscribed from channel" });
			} else {
				const unsubscribe = _app.subscribe(message.channel, receive);
				subscriptions.push({ channel: message.channel, unsubscribe });
				respond(message.channel, { name: "subscribed to channel" });
			}
		});

		_connection.socket.on("close", async _event => {
			subscriptions.forEach(_subscription => _subscription.unsubscribe());
		});
	});
};