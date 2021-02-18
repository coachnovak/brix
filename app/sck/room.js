export default async (_app, _options) => {
	_app.get("/room/", { websocket: true }, async (_connection, _request) => {
		let user = null,
			room = null,
			tunnel = null,
			rate = 0;

		setInterval(() => {
			// Rate controller.
			if (rate > 0) rate--;
		}, 250);

		_connection.socket.on("message", async _message => {
			// Rate controller.
			if (rate > 10) return;
			rate++;

			const message = JSON.parse(_message);
			const session = await _request.jwtVerify({ extractToken: _request => message?.token });
			if (!session.user) return _connection.socket.close();

			const consume = async () => {
				for await (const messages of _app.channels.consume(tunnel))
					for (const index in messages)
						_connection.socket.send(messages[index].data);
			}

			switch (message.name) {
				case "setup":
					// Ensure room is valid.
					if (!message.data?.room) return _connection.socket.send(JSON.stringify({ name: "invalid.parameter", data: "Room is invalid." }));
					room = message.data.room;

					const foundUser = await _app.mongo.db.collection("users").findOne({ _id: new _app.mongo.ObjectId(session.user) });
					if (!foundUser) return _connection.socket.send(JSON.stringify({ name: "invalid.state", message: "Session user couldn't be identified." }));

					user = {
						_id: foundUser._id.toString(),
						firstName: foundUser.firstName,
						lastName: foundUser.lastName
					}

					// Register as participant, but first ensure user isn't in the room already.
					const exists = await _app.mongo.db.collection("participants").findOne({ "user._id": new _app.mongo.ObjectId(user._id), room: new _app.mongo.ObjectId(room) });

					if (!exists) {
						let participant = {};
						participant.room = new _app.mongo.ObjectId(room);
						participant.user = {
							_id: new _app.mongo.ObjectId(user._id),
							firstName: user.firstName,
							lastName: user.lastName
						};
						participant.heartbeat = new Date();
						participant.registered = new Date();

						const registration = await _app.mongo.db.collection("participants").insertOne(participant);
						if (registration && registration.result && registration.result.ok !== 1)
							return _connection.socket.send(JSON.stringify({ name: "database.failure", data: "Failed to register participant." }));
					}

					// Create tunnel for subscribers and producers.
					tunnel = await _app.channels.use(message.data.room);
					await _app.channels.subscribe(tunnel);

					consume();
					_connection.socket.send(JSON.stringify({ name: "ready", data: null }));

					break;

				case "heartbeat":
					// Ensure setup has completed.
					if (!tunnel) return _connection.socket.send(JSON.stringify({ name: "invalid.state", data: "Setup is not completed." }));
					_app.mongo.db.collection("participants").updateOne({ "user._id": new _app.mongo.ObjectId(user._id), room: new _app.mongo.ObjectId(room) }, { $set: { heartbeat: new Date() } });

					break;

				// These messages are broadcasted.
				case "reaction":
				case "comment":
				case "new-estimate-work":
				case "vote-estimate-work":
				case "poke":
					// Ensure setup has completed before we allow broadcasting.
					if (!tunnel) return _connection.socket.send(JSON.stringify({ name: "invalid.state", data: "Setup is not completed." }));

					// Append to message.
					message.room = room;
					message.user = user;
					message.when = new Date();

					// Save event in the storage.
					await _app.mongo.db.collection("events").insertOne({
						token: message.token,
						room: new _app.mongo.ObjectId(message.room),
						user: new _app.mongo.ObjectId(message.user._id),
						name: message.name,
						data: message.data,
						when: message.when
					});

					// Delete from message.
					delete message.token;

					// Broadcast the event.
					await _app.channels.produce(tunnel, JSON.stringify(message));

					break;

				default:
					// Ensure name is acceptable for broadcast.
					if (!tunnel) return _connection.socket.send(JSON.stringify({ name: "invalid.state", data: "Setup is not completed." }));

			}
		});

		_connection.socket.on("close", async _event => {
			// Leave the room.
			if (user && room) await _app.mongo.db.collection("participants").deleteOne({ "user._id": new _app.mongo.ObjectId(user._id), room: new _app.mongo.ObjectId(room) });

			// Unsubscribe from subscription.
			if (tunnel) await _app.channels.unsubscribe(tunnel);

			user = null;
			room = null;
		});
	});
};