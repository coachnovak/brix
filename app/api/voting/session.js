export default async (_app, _options) => {
	_app.get("/:id", {
		preValidation: [_app.authentication]
	}, async (_request, _response) => {
		const session = await _app.mongo.db.collection("voting.sessions").findOne({ _id: new _app.mongo.ObjectId(_request.params.id), deleted: null });
		if (session) return _response.status(200).send(session);
		else return _response.status(404).send();
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
				required: ["topic", "participants"],
				properties: {
					topic: { type: "string" },
					participants: {
						type: "array",
						contains: { type: "string", pattern: "^[a-f0-9]{24}$" }
					}
				}
			}
		}
	}, async (_request, _response) => {
		const template = await _app.mongo.db.collection("voting.templates").findOne({ _id: new _app.mongo.ObjectId(_request.params.template), deleted: null });
		if (template === null) return _response.status(404).send({ message: "Provided template wasn't found." });;

		let session = {};
		session.room = template.room;
		session.initiator = new _app.mongo.ObjectId(_request.user.user);
		session.topic = _request.body.topic;
		session.participants = _request.body.participants
		session.options = template.options;
		session.votes = [];
		session.expires = template.expires;
		session.begun = null;
		session.ended = null;
		session.created = new Date();
		session.deleted = null;

		const response = await _app.mongo.db.collection("voting.sessions").insertOne(session);
		if (response.result?.ok !== 1) return _response.status(500).send({ message: "Failed to create a voting session." });
		session._id = response?.insertedId;

		// Publish room event.


		// Return the new session.
		return _response.status(201).send(session);
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
		const session = await _app.mongo.db.collection("voting.sessions").findOne({ _id: new _app.mongo.ObjectId(_request.params.id), deleted: null });
		if (!session) return _response.status(404).send({ message: "Session couldn't be found." });
		if (session.initiator.toString() !== _request.user.user) return _response.status(401).send({ message: "Session can only be started by the one who created it." });

		let response = await _app.mongo.db.collection("voting.sessions").updateOne({ _id: session._id, begun: null }, { $set: { begun: new Date() } });
		if (response.result?.ok !== 1) return _response.status(500).send({ message: "Failed to update when the session begun." });

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
		const session = await _app.mongo.db.collection("voting.sessions").findOne({ _id: new _app.mongo.ObjectId(_request.params.id), deleted: null });
		if (!session) return _response.status(404).send({ message: "Session couldn't be found." });
		if (session.initiator.toString() !== _request.user.user) return _response.status(401).send({ message: "Session can only be ended by the one who created it." });

		let response = await _app.mongo.db.collection("voting.sessions").updateOne({ _id: session._id, ended: null }, { $set: { ended: new Date() } });
		if (response.result?.ok !== 1) return _response.status(500).send({ message: "Failed to update when the session ended." });

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
		const session = await _app.mongo.db.collection("voting.sessions").findOne({ _id: new _app.mongo.ObjectId(_request.params.id), begun: { $ne: null }, ended: null, deleted: null });
		if (!session) return _response.status(404).send({ message: "Ongoing session couldn't be found." });

		const existing = session.votes.find(_vote => _vote.user.toString() === _request.user.user);
		if (existing) return _response.status(400).send({ message: "You have already placed your vote in this session." });

		const vote = {};
		vote.user = new _app.mongo.ObjectId(_request.user.user);
		vote.option = new _app.mongo.ObjectId(_request.params.option);
		vote.registered = new Date();

		let response = await _app.mongo.db.collection("voting.sessions").updateOne({ _id: session._id }, { $push: { votes: vote } });
		if (response.result?.ok !== 1) return _response.status(500).send({ message: "Failed to update when the session ended." });

		return _response.status(200).send({ message: "Success!" });
	});
};