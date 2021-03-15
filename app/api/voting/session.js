export default async (_app, _options) => {
	const getSession = async (_id, _status) => {
		const match = {};
		match._id = new _app.mongo.ObjectId(_id);
		match.deleted = null;

		if (_status?.new) {
			match.begun = null;
			match.ended = null;
		} else if (_status?.begun) {
			match.begun = { $ne: null };
			match.ended = null;
		} else if (_status?.ended) {
			match.begun = { $ne: null };
			match.ended = { $ne: null };
		}

		let sessions = await _app.mongo.db.collection("voting.sessions").aggregate([
			{ "$match": match },
			{ "$limit": 1 },
			{ "$unwind": "$participants" },
			{ "$lookup": {
				"from": "users",
				"localField": "participants",
				"foreignField": "_id",
				"as": "participants"
			} },
			{ "$unwind": "$participants" },
			{ "$group": {
				"_id": "$_id",
				"root": { "$mergeObjects": "$$ROOT" },
				"participants": { "$push": "$participants" }
			} },
			{
				"$replaceRoot": {
					"newRoot": {
						"$mergeObjects": ["$root", "$$ROOT"]
					}
				}
			}, {
				"$project": {
					"_id": 1,
					"room": 1,
					"initiator": 1,
					"topic": 1,
					"participants": {
						"_id": 1,
						"firstName": 1,
						"lastName": 1
					},
					"options": 1,
					"votes": 1,
					"expires": 1,
					"begun": 1,
					"ended": 1,
					"created": 1
				}
			}
		]);

		sessions = await sessions.toArray();
		return sessions.length > 0 ? sessions[0] : undefined;
	}

	_app.get("/:id", {
		preValidation: [_app.authentication]
	}, async (_request, _response) => {
		const session = await getSession(_request.params.id);
		if (!session) return _response.status(404).send({ message: "Session couldn't be found." });

		const participating = await _app.mongo.db.collection("participants").countDocuments({ room: session.room, user: new _app.mongo.ObjectId(_request.user.user) });
		if (participating === 0) return _response.status(400).send({ message: "Session can only be shown if you're in the room where it was held." });

		return _response.status(200).send(session);
	});

	_app.post("/:template", {
		preValidation: [_app.authentication],
		schema: {
			params: {
				type: "object",
				properties: {
					template: { type: "string", pattern: "^[a-f0-9]{24}$" }
				}
			},
			body: {
				type: "object",
				required: ["topic"],
				properties: {
					topic: { type: "string" }
				}
			}
		}
	}, async (_request, _response) => {
		// Get the template.
		const template = await _app.mongo.db.collection("voting.templates").findOne({ _id: new _app.mongo.ObjectId(_request.params.template), deleted: null });
		if (template === null) return _response.status(404).send({ message: "Provided template wasn't found." });;

		// Get participants.
		const participantsResponse = await _app.mongo.db.collection("participants").find({ room: template.room, left: null });
		const participants = await participantsResponse.toArray();

		let session = {};
		session.room = template.room;
		session.initiator = new _app.mongo.ObjectId(_request.user.user);
		session.topic = _request.body.topic;
		session.participants = participants.map(_participant => new _app.mongo.ObjectId(_participant.user));
		session.options = template.options;
		session.votes = [];
		session.expires = template.expires;
		session.begun = null;
		session.ended = null;
		session.created = new Date();
		session.deleted = null;

		const response = await _app.mongo.db.collection("voting.sessions").insertOne(session);
		if (response.result?.ok !== 1) return _response.status(500).send({ message: "Failed to create a voting session." });
		return _response.status(201).send({ _id: response?.insertedId });
	});

	_app.put("/:id/begin/", {
		preValidation: [_app.authentication],
		schema: {
			params: {
				type: "object",
				properties: {
					id: { type: "string", pattern: "^[a-f0-9]{24}$" }
				}
			}
		}
	}, async (_request, _response) => {
		const session = await getSession(_request.params.id, { new: true });
		if (!session) return _response.status(404).send({ message: "Session couldn't be found." });
		if (session.initiator.toString() !== _request.user.user) return _response.status(401).send({ message: "Session can only be started by the one who initiated it." });

		let response = await _app.mongo.db.collection("voting.sessions").updateOne({ _id: session._id, begun: null }, { $set: { begun: new Date() } });
		if (response.result?.ok !== 1) return _response.status(500).send({ message: "Failed to update when the session begun." });

		// Publish event to participants.
		session.participants.forEach(_participant => {
			_app.publish(`${_participant._id.toString()}-room-${session.room.toString()}`, {
				name: "voting begins",
				data: session._id,
				when: new Date()
			});
		});

		return _response.status(200).send({ message: "Success!" });
	});

	_app.put("/:id/end/", {
		preValidation: [_app.authentication],
		schema: {
			params: {
				type: "object",
				properties: {
					id: { type: "string", pattern: "^[a-f0-9]{24}$" }
				}
			}
		}
	}, async (_request, _response) => {
		const session = await getSession(_request.params.id, { begun: true });
		if (!session) return _response.status(404).send({ message: "Ongoing session couldn't be found." });
		if (session.initiator.toString() !== _request.user.user) return _response.status(401).send({ message: "Session can only be ended by the one who initiated it." });

		let response = await _app.mongo.db.collection("voting.sessions").updateOne({ _id: session._id, ended: null }, { $set: { ended: new Date() } });
		if (response.result?.ok !== 1) return _response.status(500).send({ message: "Failed to update when the session ended." });

		// Publish event to participants.
		session.participants.forEach(_participant => {
			_app.publish(`${_participant._id.toString()}-room-${session.room.toString()}`, {
				name: "voting ends",
				data: session._id,
				when: new Date()
			});
		});

		return _response.status(200).send({ message: "Success!" });
	});

	_app.post("/:id/vote/:option", {
		preValidation: [_app.authentication],
		schema: {
			params: {
				type: "object",
				properties: {
					id: { type: "string", pattern: "^[a-f0-9]{24}$" },
					option: { type: "string", pattern: "^[a-f0-9]{24}$" }
				}
			}
		}
	}, async (_request, _response) => {
		const session = await getSession(_request.params.id, { begun: true });
		if (!session) return _response.status(404).send({ message: "Ongoing session couldn't be found." });

		const existing = session.votes.find(_vote => _vote.user.toString() === _request.user.user);
		if (existing) return _response.status(400).send({ message: "You have already placed your vote in this session." });

		const vote = {};
		vote.user = new _app.mongo.ObjectId(_request.user.user);
		vote.option = new _app.mongo.ObjectId(_request.params.option);
		vote.registered = new Date();

		let response = await _app.mongo.db.collection("voting.sessions").updateOne({ _id: session._id }, { $push: { votes: vote } });
		if (response.result?.ok !== 1) return _response.status(500).send({ message: "Failed to update when the session ended." });

		// Publish event to initiator.
		if (session.initiator.toString() === vote.user.toString())
			_app.publish(`${session.initiator.toString()}-room-${session.room.toString()}`, {
				name: "voting progress",
				data: session._id,
				when: new Date()
			});

		return _response.status(200).send({ message: "Success!" });
	});

	_app.delete("/:id", {
		preValidation: [_app.authentication],
		schema: {
			params: {
				type: "object",
				properties: {
					id: { type: "string", pattern: "^[a-f0-9]{24}$" }
				}
			}
		}
	}, async (_request, _response) => {
		const session = await getSession(_request.params.id, { new: true });
		if (!session) return _response.status(404).send({ message: "Ongoing session couldn't be found." });
		if (session.initiator.toString() !== _request.user.user) return _response.status(401).send({ message: "Session can only be deleted by the one who initiated it." });

		let response = await _app.mongo.db.collection("voting.sessions").updateOne({ _id: session._id }, { $set: { deleted: new Date() } });
		if (response.result?.ok !== 1) return _response.status(500).send({ message: "Failed to delete the voting session." });

		return _response.status(200).send({ message: "Success!" });
	});
};