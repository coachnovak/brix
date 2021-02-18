export default async (_app, _options) => {
	_app.get("/:room", {
		preValidation: [_app.authentication]
	}, async (_request, _response) => {
		const isObjectId = /^[a-f\d]{24}$/i.test(_request.params.room);
		if (!isObjectId) return _response.status(400).send("Provided room is invalid.");

		const datetime = new Date();
		datetime.setSeconds(datetime.getSeconds() - 10);

		const response = await _app.mongo.db.collection("participants").find({ room: new _app.mongo.ObjectId(_request.params.room), heartbeat: { $gt: datetime } });
		const list = await response.toArray();

		return _response.status(200).send(list);
	});
};