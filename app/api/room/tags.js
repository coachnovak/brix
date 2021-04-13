export default async (_app, _options) => {
	_app.post("/:room/:label", {
		preValidation: [_app.authentication],
		schema: {
			params: {
				type: "object",
				properties: {
					room: { type: "string", pattern: "^[a-f0-9]{24}$", description: "For what room to add the tag." },
					label: { type: "string", pattern: "^[a-zA-Z0-9_-]{3,}$", description: "The tag label to add." }
				}
			}
		}
	}, async (_request, _response) => {
		// Normalize label.
		_request.params.label = _request.params.label.toLowerCase();

		const senderResult = await _app.mongo.db.collection("users").findOne({ _id: new _app.mongo.objectid(_request.user.user), deleted: null });
		if (!senderResult) return _response.status(404).send({ message: "You couldn't be found." });

		const roomResult = await _app.mongo.db.collection("rooms").findOne({ _id: new _app.mongo.objectid(_request.params.room), deleted: null });
		if (!roomResult) return _response.status(404).send({ message: "Room couldn't be found." });
		if (roomResult.owner.toString() !== senderResult._id.toString()) return _response.status(401).send({ message: "Tags can only be managed by the room owner." });
		if ((roomResult.tags ?? []).includes(_request.params.label)) return _response.status(400).send({ message: "Tag already exists for this room." });

		const response = await _app.mongo.db.collection("rooms").updateOne({ _id: roomResult._id }, { $push: { tags: _request.params.label } });
		if (response.result?.ok !== 1) return _response.status(500).send({ message: "Failed to add tag to room." });

		return _response.status(201).send({ message: "Success!" });
	});

	_app.delete("/:room/:label", {
		preValidation: [_app.authentication],
		schema: {
			params: {
				type: "object",
				properties: {
					room: { type: "string", pattern: "^[a-f0-9]{24}$", description: "In what room to delete the tag." },
					label: { type: "string", pattern: "^[a-zA-Z0-9_-]{3,}$", description: "The tag label to remove." }
				}
			}
		}
	}, async (_request, _response) => {
		// Normalize label.
		_request.params.label = _request.params.label.toLowerCase();

		const senderResult = await _app.mongo.db.collection("users").findOne({ _id: new _app.mongo.objectid(_request.user.user), deleted: null });
		if (!senderResult) return _response.status(404).send({ message: "You couldn't be found." });

		const roomResult = await _app.mongo.db.collection("rooms").findOne({ _id: new _app.mongo.objectid(_request.params.room), deleted: null });
		if (!roomResult) return _response.status(404).send({ message: "Room couldn't be found." });
		if (roomResult.owner.toString() !== senderResult._id.toString()) return _response.status(401).send({ message: "Tags can only be managed by the room owner." });
		if (!(roomResult.tags ?? []).includes(_request.params.label)) return _response.status(400).send({ message: "Tag doesn't exist in this room." });

		const response = await _app.mongo.db.collection("rooms").updateOne({ _id: roomResult._id }, { $pull: { tags: _request.params.label } });
		if (response.result?.ok !== 1) return _response.status(500).send({ message: "Failed to add tag to room." });

		return _response.status(200).send({ message: "Success!" });
	});
};