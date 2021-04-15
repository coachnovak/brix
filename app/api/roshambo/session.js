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
		const initiator = await _app.mongo.db.collection("users").findOne({ _id: session.initiator, deleted: null });
		if (!initiator) return _response.status(404).send({ message: "Initiator wasn't found." });

		// Get opponent.
		const opponent = await _app.mongo.db.collection("users").findOne({ _id: session.opponent, deleted: null });
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
};