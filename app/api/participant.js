export default async (_app, _options) => {
	_app.post("/:room", {
		preValidation: [_app.authentication]
	}, async (_request, _response) => {
		const isObjectId = /^[a-f\d]{24}$/i.test(_request.params.room);
		if (!isObjectId) return _response.status(400).send("Provided id is invalid.");

		// Validate room existence.
		const room = await _app.mongo.db.collection("rooms").findOne({ _id: new _app.mongo.ObjectId(_request.params.room), deleted: null });
		if (!room) return _response.status(400).send("Provided room doesn't exist.");

		// Get current user.
		const user = await _app.mongo.db.collection("users").findOne({ _id: new _app.mongo.ObjectId(_request.user.user), deleted: null });

		// Ensure user isn't in the room already.
		const exists = await _app.mongo.db.collection("participants").findOne({ "user._id": user._id, room: room._id });
		if (exists) return { _id: exists._id };

		let participant = {};
		participant.room = room._id;
		participant.user = {
			_id: user._id,
			firstName: user.firstName,
			lastName: user.lastName
		};
		participant.heartbeat = new Date();
		participant.registered = new Date();

		const response = await _app.mongo.db.collection("participants").insertOne(participant);
		if (response?.result?.ok !== 1) return _response.status(400).send("Failed to register participant.");

		return _response.status(201).send({ _id: response?.insertedId.toString() });
	});

	_app.put("/:id", {
		preValidation: [_app.authentication]
	}, async (_request, _response) => {
		const isObjectId = /^[a-f\d]{24}$/i.test(_request.params.id);
		if (!isObjectId) return _response.status(400).send("Provided id is invalid.");

		const response = await _app.mongo.db.collection("participants").updateOne({ _id: new _app.mongo.ObjectId(_request.params.id) }, { $set: { heartbeat: new Date() } });
		if (response?.result?.ok !== 1) return _response.status(500).send("Failed to update participant.");

		return _response.status(200).send();
	});

	_app.delete("/:id", {
		preValidation: [_app.authentication]
	}, async (_request, _response) => {
		const isObjectId = /^[a-f\d]{24}$/i.test(_request.params.id);
		if (!isObjectId) return _response.status(400).send("Provided id is invalid.");

		const result = await _app.mongo.db.collection("participants").deleteOne({ _id: new _app.mongo.ObjectId(_request.params.id) });
		if (response?.result?.ok !== 1) return _response.status(500).send("Failed to delete participant.");

		return _response.status(200).send();
	});
};