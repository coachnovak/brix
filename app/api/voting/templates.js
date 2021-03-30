export default async (_app, _options) => {
	_app.get("/:room", {
		preValidation: [_app.authentication],
		schema: {
			params: {
				type: "object",
				properties: {
					room: { type: "string", pattern: "^[a-f0-9]{24}$" }
				}
			}
		}
	}, async (_request, _response) => {
		const response = await _app.mongo.db.collection("voting.templates").find({ room: new _app.mongo.objectid(_request.params.room), deleted: null });
		const list = await response.toArray();

		return _response.status(200).send(list);
	});
};