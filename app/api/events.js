export default async (_app, _options) => {
	_app.get("/:room", {
		preValidation: [_app.authentication]
	}, async (_request, _response) => {
		const isObjectId = /^[a-f\d]{24}$/i.test(_request.params.room);
		if (!isObjectId) return _response.status(400).send("Provided room is invalid.");

		const response = await _app.mongo.db.collection("events").aggregate([
			{
				"$match": {
					"room": new _app.mongo.ObjectId(_request.params.room)
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

		const events = await response.toArray();
		const reactions = ["a like", "a heart", "laughter", "a surprise", "sadness", "anger"];

		return events.map(_event => {
			const event = {
				start: _event.when
			};

			switch (_event.name) {
				case "new-estimate-effort":
				case "new-estimate-effort": event.content = `${_event.user.firstName} initiated an effort estimation`; break;
				case "vote-estimate-effort":
				case "vote-estimate-effort": event.content = `${_event.user.firstName} voted in an effort estimation`; break;
				case "reaction": event.content = `${_event.user.firstName} reacted with ${reactions[_event.data.reactionType]}`; break;
				case "comment": event.content = `${_event.user.firstName} contributed to discussion`; break;
				case "poke": event.content = `${_event.user.firstName} poked ${_event.data.firstName}`; break;
			}

			return event;
		});
	});
};