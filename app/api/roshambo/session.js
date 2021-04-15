export default async (_app, _options) => {
	_app.get("/:id", {
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
		const session = await _app.mongo.db.collection("roshambo.sessions").findOne({ _id: new _app.mongo.objectid(_request.params.id), deleted: null });
		if (!session) return _response.status(404).send({ message: "Session couldn't be found." });

		// Get initiator.
		const initiator = await _app.mongo.db.collection("users").findOne({ _id: session.initiator, deleted: null }, { _id: true, firstName: true, lastName: true });
		if (!initiator) return _response.status(404).send({ message: "Initiator wasn't found." });

		// Get opponent.
		const opponent = await _app.mongo.db.collection("users").findOne({ _id: session.opponent, deleted: null }, { _id: true, firstName: true, lastName: true });
		if (!opponent) return _response.status(404).send({ message: "Opponent wasn't found." });

		session.initiator = initiator;
		session.opponent = opponent;

		return _response.status(200).send(session);
	});

	_app.post("/", {
		preValidation: [_app.authentication],
		schema: {
			body: {
				type: "object",
				required: ["opponent"],
				properties: {
					room: { type: "string", pattern: "^[a-f0-9]{24}$" },
					opponent: { type: "string", pattern: "^[a-f0-9]{24}$" }
				}
			}
		}
	}, async (_request, _response) => {
		// Get opponent.
		const opponent = await _app.mongo.db.collection("users").findOne({ _id: new _app.mongo.objectid(_request.body.opponent), deleted: null });
		if (!opponent) return _response.status(404).send({ message: "Opponent wasn't found." });

		// Create session.
		let session = {};
		session.room = new _app.mongo.objectid(_request.body.room);
		session.initiator = new _app.mongo.objectid(_request.user.user);
		session.opponent = opponent._id;
		session.result = [];
		session.created = new Date();
		session.deleted = null;

		const insertResponse = await _app.mongo.db.collection("roshambo.sessions").insertOne(session);
		if (insertResponse.result?.ok !== 1) return _response.status(500).send({ message: "Failed to create a roshambo session." });
		session._id = insertResponse?.insertedId;

		// Publish event to participants.
		[session.initiator, session.opponent].forEach(_participant => {
			_app.publish(`${_participant.toString()}-room-${session.room.toString()}`, {
				name: "roshambo begins",
				data: session._id,
				when: new Date()
			});
		});

		return _response.status(201).send({ _id: session._id });
	});

	_app.put("/:session/cast/:choice", {
		preValidation: [_app.authentication],
		schema: {
			params: {
				type: "object",
				properties: {
					session: { type: "string", pattern: "^[a-f0-9]{24}$" },
					choice: { type: "string", enum: ["rock", "paper", "scissor"] }
				}
			}
		}
	}, async (_request, _response) => {
		const session = await _app.mongo.db.collection("roshambo.sessions").findOne({ _id: new _app.mongo.objectid(_request.params.session), deleted: null });
		if (!session) return _response.status(404).send({ message: "Session couldn't be found." });
		if (session.initiator.toString() !== _request.user.user && session.opponent.toString() !== _request.user.user) return _response.status(401).send({ message: "A choice can only be cast by the initiator or opponent." });

		const caster = new _app.mongo.objectid(_request.user.user);
		const choice = { caster, choice: _request.params.choice };

		let response = await _app.mongo.db.collection("roshambo.sessions").updateOne({ _id: session._id, result: { $nin: [choice] } }, { $push: { result: choice } });
		if (response.result?.ok !== 1) return _response.status(500).send({ message: "Failed to cast the choice, you already casted your choice." });
		session.result.push(choice);

		// Publish completion event to participants.
		if (session.result.length === 2)
			[session.initiator, session.opponent].forEach(_participant => {
				_app.publish(`${_participant.toString()}-room-${session.room.toString()}`, {
					name: "roshambo ends",
					data: session._id,
					when: new Date()
				});
			});

		return _response.status(200).send({ message: "Success!" });
	});

	// _app.put("/:id/end/", {
	// 	preValidation: [_app.authentication],
	// 	schema: {
	// 		params: {
	// 			type: "object",
	// 			properties: {
	// 				id: { type: "string", pattern: "^[a-f0-9]{24}$" }
	// 			}
	// 		}
	// 	}
	// }, async (_request, _response) => {
	// 	const session = await getSession(_request.params.id, { begun: true });
	// 	if (!session) return _response.status(404).send({ message: "Ongoing session couldn't be found." });
	// 	if (session.initiator.toString() !== _request.user.user) return _response.status(401).send({ message: "Session can only be ended by the one who initiated it." });

	// 	let response = await _app.mongo.db.collection("voting.sessions").updateOne({ _id: session._id, ended: null }, { $set: { ended: new Date() } });
	// 	if (response.result?.ok !== 1) return _response.status(500).send({ message: "Failed to update when the session ended." });

	// 	// Publish event to participants.
	// 	session.participants.forEach(_participant => {
	// 		_app.publish(`${_participant._id.toString()}-room-${session.room.toString()}`, {
	// 			name: "voting ends",
	// 			data: session._id,
	// 			when: new Date()
	// 		});
	// 	});

	// 	return _response.status(200).send({ message: "Success!" });
	// });

	// _app.post("/:id/vote/:option", {
	// 	preValidation: [_app.authentication],
	// 	schema: {
	// 		params: {
	// 			type: "object",
	// 			properties: {
	// 				id: { type: "string", pattern: "^[a-f0-9]{24}$" },
	// 				option: { type: "string", pattern: "^[a-f0-9]{24}$" }
	// 			}
	// 		}
	// 	}
	// }, async (_request, _response) => {
	// 	const session = await getSession(_request.params.id, { begun: true });
	// 	if (!session) return _response.status(404).send({ message: "Ongoing session couldn't be found." });

	// 	const existing = session.votes.find(_vote => _vote.user.toString() === _request.user.user);
	// 	if (existing) return _response.status(400).send({ message: "You have already placed your vote in this session." });

	// 	const vote = {};
	// 	vote.user = new _app.mongo.objectid(_request.user.user);
	// 	vote.option = new _app.mongo.objectid(_request.params.option);
	// 	vote.registered = new Date();

	// 	let response = await _app.mongo.db.collection("voting.sessions").updateOne({ _id: session._id }, { $push: { votes: vote } });
	// 	if (response.result?.ok !== 1) return _response.status(500).send({ message: "Failed to update when the session ended." });

	// 	// Publish event to initiator.
	// 	if (session.initiator.toString() === vote.user.toString())
	// 		_app.publish(`${session.initiator.toString()}-room-${session.room.toString()}`, {
	// 			name: "voting progress",
	// 			data: session._id,
	// 			when: new Date()
	// 		});

	// 	return _response.status(200).send({ message: "Success!" });
	// });

	// _app.delete("/:id", {
	// 	preValidation: [_app.authentication],
	// 	schema: {
	// 		params: {
	// 			type: "object",
	// 			properties: {
	// 				id: { type: "string", pattern: "^[a-f0-9]{24}$" }
	// 			}
	// 		}
	// 	}
	// }, async (_request, _response) => {
	// 	const session = await getSession(_request.params.id, { new: true });
	// 	if (!session) return _response.status(404).send({ message: "Ongoing session couldn't be found." });
	// 	if (session.initiator.toString() !== _request.user.user) return _response.status(401).send({ message: "Session can only be deleted by the one who initiated it." });

	// 	let response = await _app.mongo.db.collection("voting.sessions").updateOne({ _id: session._id }, { $set: { deleted: new Date() } });
	// 	if (response.result?.ok !== 1) return _response.status(500).send({ message: "Failed to delete the voting session." });

	// 	return _response.status(200).send({ message: "Success!" });
	// });
};