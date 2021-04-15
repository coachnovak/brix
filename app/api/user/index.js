export default async (_app, _options) => {
	_app.register(await import("./avatar.js"), { prefix: "avatar" });
	_app.register(await import("./cover.js"), { prefix: "cover" });

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
		const user = await _app.mongo.db
			.collection("users")
			.findOne({
				_id: new _app.mongo.objectid(_request.params.id),
				deleted: null
			}, {
				projection: {
					_id: true,
					email: true,
					firstName: true,
					lastName: true,
					registered: true
				}
			});

		if (!user) return _response.status(401).send({ message: "Failed to obtain the identity, user wasn't found." });
		return _response.status(200).send(user);
	});
};