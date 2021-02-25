import crypto from "crypto";

export default async (_app, _options) => {
	_app.get("/:room", {
		preValidation: [_app.authentication]
	}, async (_request, _response) => {
		const isObjectId = /^[a-f\d]{24}$/i.test(_request.params.room);
		if (!isObjectId) return _response.status(400).send("Provided room is invalid.");

		const roomResult = await _app.mongo.db.collection("rooms").findOne({ _id: new _app.mongo.ObjectId(_request.params.room), deleted: null });
		if (!roomResult) return _response.status(404).send({ message: "Room couldn't be found." });
		if (roomResult.owner.toString() !== _request.user.user) return _response.status(401).send({ message: "Invites can only be seen by the room owner." });

		const invites = await _app.mongo.db.collection("invites").find({ "room._id": new _app.mongo.ObjectId(_request.params.room), deleted: null }).toArray();
		return _response.status(200).send(invites);
	});

	_app.post("/:room", {
		preValidation: [_app.authentication]
	}, async (_request, _response) => {
		const isObjectId = /^[a-f\d]{24}$/i.test(_request.params.room);
		if (!isObjectId) return _response.status(400).send({ message: "Provided id is invalid." });

		const senderResult = await _app.mongo.db.collection("users").findOne({ _id: new _app.mongo.ObjectId(_request.user.user), deleted: null });
		if (!senderResult) return _response.status(404).send({ message: "You couldn't be found." });

		const recipientResult = await _app.mongo.db.collection("users").findOne({ email: _request.body.email, deleted: null });
		if (!recipientResult) return _response.status(404).send({ message: "Recipient couldn't be found." });

		if (senderResult._id.toString() === recipientResult._id.toString())
			return _response.status(400).send({ message: "You cant send yourself an invite." });

		const roomResult = await _app.mongo.db.collection("rooms").findOne({ _id: new _app.mongo.ObjectId(_request.params.room), deleted: null });
		if (!roomResult) return _response.status(404).send({ message: "Room couldn't be found." });
		if (roomResult.owner.toString() !== senderResult._id.toString()) return _response.status(401).send({ message: "Invites can only be sent by the room owner." });

		const invitedResult = await _app.mongo.db.collection("invites").findOne({ "room._id": roomResult._id, "sender._id": senderResult._id, "recipient._id": recipientResult._id, deleted: null });
		if (invitedResult) return _response.status(400).send({ message: "Person already invited to this room." });

		let invite = {};
		invite.room = { _id: roomResult._id, name: roomResult.name };
		invite.sender = { _id: senderResult._id, firstName: senderResult.firstName, lastName: senderResult.lastName };
		invite.recipient = { _id: recipientResult._id, firstName: recipientResult.firstName, lastName: recipientResult.lastName };
		invite.expires = null;
		invite.deleted = null;
		invite.created = new Date();

		if (_request.body?.ttl) {
			// Expiration must be set.
			invite.expires = new Date();
			invite.expires.setSeconds(invite.expires.getSeconds() + _request.body.ttl);
		}

		const response = await _app.mongo.db.collection("invites").insertOne(invite);
		if (response.result?.ok !== 1) return _response.status(500).send("Failed to send invite.");

		invite._id = response?.insertedId;
		return _response.status(201).send(invite);
	});

	_app.delete("/:id", {
		preValidation: [_app.authentication]
	}, async (_request, _response) => {
		const isObjectId = /^[a-f\d]{24}$/i.test(_request.params.id);
		if (!isObjectId) return _response.status(400).send({ message: "Provided id is invalid." });

		const invitedResult = await _app.mongo.db.collection("invites").findOne({ _id: new _app.mongo.ObjectId(_request.params.id), deleted: null });
		if (!invitedResult) return _response.status(404).send({ message: "We couldn't find the invitation." });

		const roomResult = await _app.mongo.db.collection("rooms").findOne({ _id: invitedResult.room._id, deleted: null });
		if (!roomResult) return _response.status(404).send({ message: "Room couldn't be found." });

		if (
			roomResult.owner.toString() !== _request.user.user &&
			invitedResult.recipient._id.toString() !== _request.user.user
		) return _response.status(401).send({ message: "Invites can be revoked by room owner or invitee." });

		const response = await _app.mongo.db.collection("invites").updateOne({ _id: new _app.mongo.ObjectId(_request.params.id) }, { $set: { deleted: null } });
		if (response.result?.ok !== 1) return _response.status(500).send("Failed to delete an invite.");

		return _response.status(200).send();
	});
};