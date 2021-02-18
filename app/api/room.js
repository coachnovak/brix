import crypto from "crypto";

export default async (_app, _options) => {
	_app.get("/:id", {
		preValidation: [_app.authentication]
	}, async (_request, _response) => {
		const isObjectId = /^[a-f\d]{24}$/i.test(_request.params.id);
		const isAlias = /^[a-zA-Z0-9]{10}$/.test(_request.params.id);
		if (!isObjectId && !isAlias) return _response.status(400).send("Provided id or alias is invalid.");

		const room = await _app.mongo.db.collection("rooms").findOne(
			isObjectId ? { _id: new _app.mongo.ObjectId(_request.params.id) } : { alias: _request.params.id.toLowerCase() }
		);

		if (room) return _response.status(200).send(room);
		else return _response.status(404).send();
	});

	_app.get("/participants/:id", {
		preValidation: [_app.authentication]
	}, async (_request, _response) => {
		const isObjectId = /^[a-f\d]{24}$/i.test(_request.params.id);
		if (!isObjectId) return _response.status(400).send({ message: "Provided id is invalid." });

		const count = await _app.mongo.db.collection("participants").countDocuments({ room: new _app.mongo.ObjectId(_request.params.id) });
		return _response.status(200).send(count);
	});

	_app.post("/", {
		preValidation: [_app.authentication]
	}, async (_request, _response) => {
		const validate = async _alias => {
			const result = await _app.mongo.db.collection("rooms").findOne({ alias: _alias });
			return result === null;
		}

		let room = {};
		room.owner = new _app.mongo.ObjectId(_request.user.user);
		room.name = _request.body.name;
		room.alias = crypto.randomBytes(5).toString("hex");
		room.deleted = null;
		room.created = new Date();

		const isName = /^[a-zA-Z0-9 _]{1,20}$/.test(_request.params.id);
		if (!isName) return _response.status(400).send({ message: "Provided name is invalid." });

		for (let index = 0; index < 10; index++) {
			const valid = await validate(room.alias);

			if (!valid) room.alias = crypto.randomBytes(5).toString("hex");
			else break;
		}

		const response = await _app.mongo.db.collection("rooms").insertOne(room);
		if (response.result?.ok !== 1) return _response.status(500).send("Failed to create a new room.");

		room._id = response?.insertedId;
		return _response.status(201).send(room);
	});

	_app.put("/:id", {
		preValidation: [_app.authentication]
	}, async (_request, _response) => {
		const isObjectId = /^[a-f\d]{24}$/i.test(_request.params.id);
		if (!isObjectId) return _response.status(400).send("Provided id is invalid.");

		const response = await _app.mongo.db.collection("rooms").updateOne({ _id: new _app.mongo.ObjectId(_request.params.id) }, { $set: _request.body });
		if (response.result?.ok !== 1) return _response.status(500).send("Failed to update a room.");

		return _response.status(200).send();
	});

	_app.delete("/:id", {
		preValidation: [_app.authentication]
	}, async (_request, _response) => {
		const isObjectId = /^[a-f\d]{24}$/i.test(_request.params.id);
		if (!isObjectId) return _response.status(400).send({ message: "Provided id is invalid." });

		const response = await _app.mongo.db.collection("rooms").deleteOne({ _id: new _app.mongo.ObjectId(_request.params.id) });
		if (response.result?.ok !== 1) return _response.status(500).send("Failed to update a room.");

		return _response.status(200).send();
	});
};