import crypto from "crypto";

export default async (_app, _options) => {
	_app.register(await import("./invites.js"), { prefix: "invites" });

	_app.get("/:id", {
		preValidation: [_app.authentication]
	}, async (_request, _response) => {
		const isObjectId = /^[a-f\d]{24}$/i.test(_request.params.id);
		if (!isObjectId) return _response.status(400).send({ message: "Provided id is invalid." });

		const room = await _app.mongo.db.collection("rooms").findOne({ _id: new _app.mongo.objectid(_request.params.id), deleted: null });
		if (room) return _response.status(200).send(room);
		else return _response.status(404).send();
	});

	_app.get("/participants/:id", {
		preValidation: [_app.authentication]
	}, async (_request, _response) => {
		const isObjectId = /^[a-f\d]{24}$/i.test(_request.params.id);
		if (!isObjectId) return _response.status(400).send({ message: "Provided id is invalid." });

		const count = await _app.mongo.db.collection("participants").countDocuments({ room: new _app.mongo.objectid(_request.params.id), deleted: null });
		return _response.status(200).send(count);
	});

	_app.post("/", {
		preValidation: [_app.authentication]
	}, async (_request, _response) => {
		const validate = async _alias => {
			const result = await _app.mongo.db.collection("rooms").findOne({ alias: _alias, deleted: null });
			return result === null;
		}

		let room = {};
		room.owner = new _app.mongo.objectid(_request.user.user);
		room.name = _request.body.name;
		room.alias = crypto.randomBytes(5).toString("hex");
		room.tags = [];
		room.created = new Date();
		room.deleted = null;

		const isName = /^[a-zA-Z0-9 _]{1,40}$/.test(_request.params.id);
		if (!isName) return _response.status(400).send({ message: "Provided name is invalid." });

		for (let index = 0; index < 10; index++) {
			const valid = await validate(room.alias);

			if (!valid) room.alias = crypto.randomBytes(5).toString("hex");
			else break;
		}

		const response = await _app.mongo.db.collection("rooms").insertOne(room);
		if (response.result?.ok !== 1) return _response.status(500).send({ message: "Failed to create a new room." });

		room._id = response?.insertedId;
		return _response.status(201).send(room);
	});

	_app.put("/rename/:id", {
		preValidation: [_app.authentication],
		schema: {
			params: {
				type: "object",
				properties: {
					id: { type: "string", pattern: "^[a-f0-9]{24}$", description: "Room to change the name of." }
				}
			}
		}
	}, async (_request, _response) => {
		const roomResult = await _app.mongo.db.collection("rooms").findOne({ _id: new _app.mongo.objectid(_request.params.id), deleted: null });
		if (!roomResult) return _response.status(404).send({ message: "Room couldn't be found." });
		if (roomResult.owner.toString() !== _request.user.user) return _response.status(401).send({ message: "Room can only be renamed by the owner." });
		const oldName = roomResult.name;
		const newName = _request.body?.name ?? "Untitled";
		roomResult.name = newName;

		const response = await _app.mongo.db.collection("rooms").updateOne({ _id: roomResult._id }, { $set: { name: newName } });
		if (response.result?.ok !== 1) return _response.status(500).send({ message: "Failed to rename the room." });

		_app.publish(`all-room-${_request.params.id}`, {
			name: "renamed",
			data: {
				room: roomResult._id.toString(),
				oldName,
				newName
			},
			when: new Date()
		});

		return _response.status(200).send(roomResult);
	});

	_app.delete("/:id", {
		preValidation: [_app.authentication],
		schema: {
			params: {
				type: "object",
				properties: {
					id: { type: "string", pattern: "^[a-f0-9]{24}$", description: "Room to delete." }
				}
			}
		}
	}, async (_request, _response) => {
		const roomResult = await _app.mongo.db.collection("rooms").findOne({ _id: new _app.mongo.objectid(_request.params.id), deleted: null });
		if (!roomResult) return _response.status(404).send({ message: "Room couldn't be found." });
		if (roomResult.owner.toString() !== _request.user.user) return _response.status(401).send({ message: "Room can only be deleted by the owner." });

		let response = await _app.mongo.db.collection("rooms").updateOne({ _id: roomResult._id }, { $set: { deleted: new Date() } });
		if (response.result?.ok !== 1) return _response.status(500).send({ message: "Failed to delete the room." });

		response = await _app.mongo.db.collection("invites").updateOne({ "room._id": roomResult._id }, { $set: { deleted: new Date() } });
		if (response.result?.ok !== 1) return _response.status(500).send({ message: "Failed to delete room invites." });

		response = await _app.mongo.db.collection("events").updateOne({ "room": roomResult._id }, { $set: { deleted: new Date() } });
		if (response.result?.ok !== 1) return _response.status(500).send({ message: "Failed to delete room events." });

		_app.publish(`all-room-${_request.params.id}`, {
			name: "deleted",
			data: {
				room: roomResult._id
			},
			when: new Date()
		});

		return _response.status(200).send();
	});
};