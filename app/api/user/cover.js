export default async (_app, _options) => {
	_app.get("/:user", {
		schema: {
			params: {
				type: "object",
				properties: {
					room: { type: "string", pattern: "^[a-f0-9]{24}$", description: "User id for which to get the cover." }
				}
			}
		}
	}, async (_request, _response) => {
		const user = await _app.mongo.db
			.collection("users")
			.findOne({
				_id: new _app.mongo.objectid(_request.params.user),
				deleted: null
			}, {
				cover: true
			});

		if (!user) return _response.status(401).send({ message: "Failed to obtain the identity, user wasn't found." });
		if (!user?.cover?.fileid) return _response.status(404).send({ message: "User doesn't have an cover." });

		// Get file from storage.
		const bucket = new _app.mongo.storage(_app.mongo.db, { bucketName: "covers" });
		const downloadStream = bucket.openDownloadStream(user.cover.fileid);
		return _response.type(user.cover.mimetype).status(200).send(downloadStream);
	});
};