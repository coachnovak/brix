export default async (_app, _options) => {
	_app.get("/", {
		preValidation: [_app.authentication]
	}, async (_request, _response) => {
		const user = await _app.mongo.db
			.collection("users")
			.findOne({
				_id: new _app.mongo.objectid(_request.user.user),
				deleted: null
			}, {
				projection: {
					_id: true,
					email: true,
					firstName: true,
					lastName: true,
					registered: true,
					confirmed: true
				}
			});

		if (!user)
			return _response.status(401).send({ message: "Failed to obtain the identity, user wasn't found." });
		else if (user.confirmed === null)
			return _response.status(400).send({ message: "The user account must be activated before first use." });

		return _response.status(200).send(user);
	});
};