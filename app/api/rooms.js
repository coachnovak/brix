export default async (_app, _options) => {
	_app.get("/", {
		preValidation: [_app.authentication]
	}, async (_request, _response) => {
		const response = await _app.mongo.db.collection("rooms").aggregate([
			{
				"$match": {
					"owner": new _app.mongo.objectid(_request.user.user),
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
		const count = await _app.mongo.db.collection("rooms").countDocuments({ owner: new _app.mongo.objectid(_request.user.user), deleted: null });
		return _response.status(200).send(count);
	});

	_app.post("/search/", {
		preValidation: [_app.authentication],
		schema: {
			body: {
				type: "object",
				required: ["name", "labels"],
				properties: {
					name: {
						type: "string",
						pattern: "^[a-zA-Z0-9 _]{0,40}$",
						description: "Search for rooms with part of name."
					},
					labels: {
						type: "array",
						description: "Search for rooms containing these tag labels.",
						items: {
							type: "string"
						}
					}
				}
			}
		}
	}, async (_request, _response) => {
		let match = { deleted: null };
		if (_request.body.name && _request.body.name.length > 0) match["$text"] = { "$search": _request.body.name };
		if (_request.body.labels && _request.body.labels.length > 0) match.tags = { "$all": _request.body.labels.map(_label => _label.toLowerCase()) };

		const response = await _app.mongo.db.collection("rooms").aggregate([
			{
				"$match": match
			}, {
				"$lookup": {
					"from": "invites",
					"let": {
						"roomid": "$_id"
					},
					"pipeline": [{
						"$match": {
							"$expr": {
								"$and": [
									{ "$eq": ["$room._id", "$$roomid"] },
									{ "$eq": ["$recipient._id", new _app.mongo.objectid(_request.user.user)] },
									{ "$eq": ["$deleted", null] }
								]
							}
						}
					}],
					"as": "invites"
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
					"name": "$name",
					"owner": "$owner",
					"alias": "$alias",
					"participants": {
						"$size": "$participants"
					},
					"invites": {
						"$size": "$invites"
					}
				}
			},
			{
				"$match": {
					"$or": [
						{ "owner": { "$eq": new _app.mongo.objectid(_request.user.user) } },
						{ "invites": { "$gt": 0 } }
					]
				}
			}, {
				"$project": {
					"_id": "$_id",
					"name": "$name",
					"alias": "$alias",
					"participants": "$participants"
				}
			}, {
				"$sort": {
					"name": 1
				}
			}
		]);

		return await response.toArray();
	});
};