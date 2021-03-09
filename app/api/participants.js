export default async (_app, _options) => {
	_app.get("/:room", {
		preValidation: [_app.authentication],
		schema: {
			params: {
				type: "object",
				properties: {
					room: { type: "string", pattern: "^[a-f0-9]{24}$", description: "Room to change the name of." }
				}
			}
		}
	}, async (_request, _response) => {
		const datetime = new Date();
		datetime.setSeconds(datetime.getSeconds() - 10);

		const response = await _app.mongo.db.collection("participants").aggregate([
			{
				"$match": {
					"room": new _app.mongo.ObjectId(_request.params.room),
					"heartbeat": { $gt: datetime },
					"left": null
				}
			}, {
				"$lookup": {
					"from": "users",
					"localField": "user",
					"foreignField": "_id",
					"as": "users"
				}
			}, {
				"$unwind": {
					"path": "$users",
					"preserveNullAndEmptyArrays": true
				  }
			}, {
				"$project": {
					"_id": "$_id",
					"room": "$room",
					"user": {
						"_id": "$users._id",
						"firstName": "$users.firstName",
						"lastName": "$users.lastName"
					},
					"joined": "$joined",
					"heartbeat": "$heartbeat",
					"left": "$left"
				}
			}
		]);

		return await response.toArray();
	});
};