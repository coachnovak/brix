import crypto from "crypto";

export default async (_app, _options) => {
	_app.post("/", {
		preValidation: [_app.authentication]
	}, async (_request, _response) => {
		if (!/^[a-z\d.]+#[a-f\d]{24}$/i.test(_request.params.channel))
			return _response.status(400).send("Provided channel is invalid.");

		if (!_request.params.text)
			return _response.status(400).send("Provided text is invalid.");

		// Get current user.
		const user = await _app.mongo.db.collection("users").findOne({ _id: new _app.mongo.ObjectId(_request.user.user), deleted: null });

		const comment = {
			channel: _request.params.channel,
			user: {
				_id: user._id,
				firstName: user.firstName,
				lastName: user.lastName
			}
		};

		const response = await _app.mongo.db.collection("comments").insertOne(comment);
		if (response.result?.ok !== 1) return _response.status(500).send("Failed to create comment.");

		room._id = response?.insertedId;
		return _response.status(201).send(room);
	});
};