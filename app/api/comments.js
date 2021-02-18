export default async (_app, _options) => {
	_app.get("/:room", {
		preValidation: [_app.authentication]
	}, async (_request, _response) => {
		const isObjectId = /^[a-f\d]{24}$/i.test(_request.params.room);
		if (!isObjectId) return _response.status(400).send("Provided room is invalid.");

		const response = await _app.mongo.db.collection("events").aggregate([
			{
				"$match": {
					"room": new _app.mongo.ObjectId(_request.params.room),
					"name": "comment"
				}
			}, {
				"$sort": {
					"when": -1
				}
			}, {
				"$limit": 100
			}, {
				"$lookup": {
					"from": "users",
					"localField": "user",
					"foreignField": "_id",
					"as": "user"
				}
			}, {
				"$unwind": "$user"
			}, {
				"$project": {
					"_id": false,
					"room": {
						"$toString": "$room"
					},
					"user": {
						"_id": {
							"$toString": "$user._id"
						},
						"firstName": true,
						"lastName": true
					},
					"name": true,
					"data": true,
					"when": true
				}
			}, {
				"$sort": {
					"when": 1
				}
			}
		]);

		return await response.toArray();
	});
};