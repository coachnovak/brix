export default async (_app, _options) => {
	_app.get("/", {
		preValidation: [_app.authentication]
	}, async (_request, _response) => {
		const invites = await _app.mongo.db.collection("invites").find({ "recipient._id": new _app.mongo.objectid(_request.user.user), deleted: null }).toArray();
		return _response.status(200).send(invites);
	});
};