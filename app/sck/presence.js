export default async (_app, _options) => {
	_app.get("/", {
		websocket: true
	}, async (_connection, _request) => {
		let room, user;

		_connection.socket.on("message", async _message => {
			const message = JSON.parse(_message);

			if (message?.join && message?.token) {
				// Validate room existence.
				room = await _app.mongo.db.collection("rooms").findOne({ _id: new _app.mongo.ObjectId(message?.join), deleted: null });
				if (!room) return _connection.socket.close();

				// Get token session.
				const session = await _request.jwtVerify({ extractToken: _request => message?.token });
				if (!session?.user) return _connection.socket.close();

				// Get token user.
				user = await _app.mongo.db.collection("users").findOne({ _id: new _app.mongo.ObjectId(session?.user), deleted: null }, { _id: 1, firstName: 1, lastName: 1 });
				if (!user) return _connection.socket.close();

				let participant = {};
				participant.room = room._id;
				participant.user = user._id;
				participant.heartbeat = new Date();
				participant.joined = new Date();
				participant.heartbeat = new Date();
				participant.left = null;

				// Ensure user isn't in the room already.
				const exists = await _app.mongo.db
					.collection("participants")
					.findOne({ user: user._id, room: room._id }, { _id: 1 });

				if (exists) {
					participant._id = exists._id;
					await _app.mongo.db
						.collection("participants")
						.updateOne({ _id: exists._id }, { $set: { heartbeat: new Date(), left: null } });
				} else  {
					const insertResult = await _app.mongo.db.collection("participants").insertOne(participant);
					if (insertResult?.result?.ok !== 1) return _connection.socket.send(JSON.stringify({
						code: 500,
						message: "Failed to register participant.",
						when: new Date()
					}));

					participant._id = insertResult.insertedId;
				}

				_connection.socket.send(JSON.stringify({
					code: 200,
					message: "Your presence was registered successfully.",
					when: new Date()
				}));

				_app.publish(`all-room-${room._id.toString()}`, {
					name: "joined",
					data: {
						room: room._id.toString(),
						user: {
							_id: user._id,
							firstName: user.firstName,
							lastName: user.lastName
						}
					},
					when: new Date()
				});
			} else if (message?.alive) {
				if (!room || !user) return _connection.socket.close();

				await _app.mongo.db
					.collection("participants")
					.updateOne({ room: room._id, user: user._id }, { $set: { heartbeat: new Date(), left: null } });
			}
		});

		_connection.socket.on("close", async _event => {
			if (room && user)
				await _app.mongo.db
					.collection("participants")
					.updateOne({ room: room._id, user: user._id }, { $set: { left: new Date() } });
		});
	});
};