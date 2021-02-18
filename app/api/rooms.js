export default async (_app, _options) => {
	_app.get("/", {
		preValidation: [_app.authentication]
	}, async (_request, _response) => {
		const response = await _app.mongo.db.collection("rooms").aggregate([
			{
				"$match": {
					"owner": new _app.mongo.ObjectId(_request.user.user),
					"deleted": null
				}
			}, {
				"$lookup": {
					"from": "participants",
					"localField": "_id",
					"foreignField": "room",
					"as": "participants"
				}
			}, {
				"$project": {
					"_id": "$_id",
					"owner": "$_owner",
					"name": "$name",
					"alias": "$alias",
					"participants": {
						"$size": "$participants"
					}
				}
			}
		]);

		return await response.toArray();
	});

	_app.get("/count/", {
		preValidation: [_app.authentication]
	}, async (_request, _response) => {
		const count = await _app.mongo.db.collection("rooms").countDocuments({ owner: new _app.mongo.ObjectId(_request.user.user) });
		return _response.status(200).send(count);
	});
};