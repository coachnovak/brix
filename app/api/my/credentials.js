export default async (_app, _options) => {
	_app.put("/", {
		preValidation: [_app.authentication],
		schema: {
			body: {
				type: "object",
				properties: {
					firstName: { type: "string", description: "The first or given name of the user." },
					lastName: { type: "string", description: "The last or family name of the user." }
				}
			}
		}
	}, async (_request, _response) => {
		let { firstName, lastName } = _request.body;

		if (!firstName || !lastName)
			return _response.status(400).send("Missing mandatory parameters");

		const firstNameValid = /^[a-zA-Z\u00C0-\u00ff]+$/i.test(firstName);
		if (!firstNameValid) { _response.status(400).send({ message: "Provided first name is invalid." }); return; }

		const lastNameValid = /^[a-zA-Z\u00C0-\u00ff]+$/.test(lastName);
		if (!lastNameValid) { _response.status(400).send({ message: "Provided last name is invalid." }); return; }

		await _app.mongo.db.collection("users").updateOne({
			_id: new _app.mongo.objectid(_request.user.user),
			deleted: null
		}, {
			$set: {
				firstName,
				lastName
			}
		});

		if (registrationResponse?.result?.ok !== 1)
			return _response.status(500).send({ message: "Failed to update profile." });

		return _response.status(201).send({ message: "Success!" });
	});
};