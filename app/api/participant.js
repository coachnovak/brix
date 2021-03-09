export default async (_app, _options) => {
	_app.get("/:room/poke/:recipient", {
		preValidation: [_app.authentication],
		schema: {
			params: {
				type: "object",
				properties: {
					room: { type: "string", pattern: "^[a-f0-9]{24}$", description: "Room in which the poke should occur." },
					recipient: { type: "string", pattern: "^[a-f0-9]{24}$", description: "Poke recipient." }
				}
			}
		}
	}, async (_request, _response) => {
		// Validate room existence.
		const room = await _app.mongo.db.collection("rooms").findOne({ _id: new _app.mongo.ObjectId(_request.params.room), deleted: null });
		if (!room) return _response.status(400).send("Provided room doesn't exist.");

		// Get sender.
		const sender = await _app.mongo.db.collection("users").findOne({ _id: new _app.mongo.ObjectId(_request.user.user), deleted: null });
		if (!sender) return _response.status(400).send("Sender wasn't found.");

		// Get recipient.
		const recipient = await _app.mongo.db.collection("users").findOne({ _id: new _app.mongo.ObjectId(_request.params.recipient), deleted: null });
		if (!recipient) return _response.status(400).send("Recipient wasn't found.");

		_app.publish(`${recipient._id.toString()}-room-${_request.params.room}`, {
			name: "poke",
			data: {
				room: room._id,
				sender: sender._id,
				recipient: recipient._id
			},
			when: new Date()
		});

		return _response.status(200).send({ message: "Success!" });
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