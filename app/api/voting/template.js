import { Validator } from "@cfworker/json-schema";
import db from "../../../db/index.js";
import template from "../../../db/models/voting/template.js";

export default async (_app, _options) => {
	_app.get("/:id", {
		preValidation: [_app.authentication],
		schema: {
			params: {
				type: "object",
				properties: {
					id: { type: "string", pattern: "^[a-f0-9]{24}$" }
				}
			}
		}
	}, async (_request, _response) => {
		const isObjectId = /^[a-f\d]{24}$/i.test(_request.params.id);
		if (!isObjectId) return _response.status(400).send({ message: "Provided id is invalid." });

		const template = await _app.mongo.db.collection("voting.templates").findOne({ _id: new _app.mongo.ObjectId(_request.params.id), deleted: null });
		if (template) return _response.status(200).send(template);
		else return _response.status(404).send();
	});

	_app.post("/:room", {
		preValidation: [_app.authentication],
		schema: {
			params: {
				type: "object",
				properties: {
					room: { type: "string", pattern: "^[a-f0-9]{24}$" }
				}
			},
			body: {
				type: "object",
				required: ["name", "expires"],
				properties: {
					name: { type: "string" },
					items: {
						type: "array",
						contains: {
							type: "object",
							properties: {
								_id: { type: "object" },
								icon: { type: "string" },
								label: { type: "string" }
							}
						}
					},
					expires: { type: ["number", "null"] }
				}
			}
		}
	}, async (_request, _response) => {
		const room = await _app.mongo.db.collection("rooms").findOne({ _id: new _app.mongo.ObjectId(_request.params.room), deleted: null });
		if (room === null) return _response.status(404).send({ message: "Provided room wasn't found." });
		if (room.owner.toString() !== _request.user.user) return _response.status(401).send({ message: "Templates can only be created by the room owner." });

		// Assign ids to options.
		_request.body.options = (_request.body.options ?? []).map(_option => {
			return { _id: new _app.mongo.ObjectId(), label: _option.label }
		});

		let template = {};
		template.room = room._id;
		template.name = _request.body.name;
		template.options = _request.body.options;
		template.expires = _request.body.expires;
		template.created = new Date();
		template.deleted = null;

		const templateValidator = new Validator(db.models.voting.template.schema);
		const templateValidation = templateValidator.validate(template);
		if (!templateValidation.valid) return _response.status(400).send({ message: "Template didn't match schema.", errors: templateValidation.errors });

		const response = await _app.mongo.db.collection(db.models.voting.template.collection).insertOne(template);
		if (response.result?.ok !== 1) return _response.status(500).send({ message: "Failed to create a voting session." });
		template._id = response?.insertedId;

		// Publish room event.


		// Return the new session.
		return _response.status(201).send(template);
	});

	_app.post("/:template/option/", {
		preValidation: [_app.authentication],
		schema: {
			params: {
				type: "object",
				properties: {
					template: { type: "string", pattern: "^[a-f0-9]{24}$" }
				}
			},
			body: {
				type: "object",
				required: ["label"],
				properties: {
					icon: { type: "string" },
					label: { type: "string" },
					order: { type: "number" }
				}
			}
		}
	}, async (_request, _response) => {
		const templateResult = await _app.mongo.db.collection("voting.templates").findOne({ _id: new _app.mongo.ObjectId(_request.params.template), deleted: null });
		if (!templateResult) return _response.status(404).send({ message: "Template couldn't be found." });

		const roomResult = await _app.mongo.db.collection("rooms").findOne({ _id: templateResult.room, deleted: null });
		if (!roomResult) return _response.status(404).send({ message: "Room couldn't be found." });
		if (roomResult.owner.toString() !== _request.user.user) return _response.status(401).send({ message: "Template option can only be deleted by the room owner." });

		let option = { _id: new _app.mongo.ObjectId() };
		if (_request?.body?.icon) option.icon = _request.body.icon;
		if (_request?.body?.label) option.label = _request.body.label;
		if (_request?.body?.order) option.order = _request.body.order;

		let response = await _app.mongo.db.collection("voting.templates").updateOne({ _id: templateResult._id }, { $push: { options: option } });
		if (response.result?.ok !== 1) return _response.status(500).send({ message: "Failed to update the option." });

		return _response.status(200).send({ message: "Success!" });
	});

	_app.put("/:id", {
		preValidation: [_app.authentication],
		schema: {
			params: {
				type: "object",
				properties: {
					id: { type: "string", pattern: "^[a-f0-9]{24}$" }
				}
			},
			body: {
				type: "object",
				properties: {
					name: { type: "string" },
					expires: { type: ["number", "null"] }
				}
			}
		}
	}, async (_request, _response) => {
		const templateResult = await _app.mongo.db.collection("voting.templates").findOne({ _id: new _app.mongo.ObjectId(_request.params.id), deleted: null });
		if (!templateResult) return _response.status(404).send({ message: "Template couldn't be found." });

		const roomResult = await _app.mongo.db.collection("rooms").findOne({ _id: templateResult.room, deleted: null });
		if (!roomResult) return _response.status(404).send({ message: "Room couldn't be found." });
		if (roomResult.owner.toString() !== _request.user.user) return _response.status(401).send({ message: "Template can only be deleted by the room owner." });

		let templateChanges = {};
		if (_request?.body?.name) templateChanges.name = _request.body.name;
		if (_request?.body?.expires) templateChanges.expires = _request.body.expires;

		let response = await _app.mongo.db.collection("voting.templates").updateOne({ _id: templateResult._id }, { $set: templateChanges });
		if (response.result?.ok !== 1) return _response.status(500).send({ message: "Failed to delete the template." });

		return _response.status(200).send({ message: "Success!" });
	});

	_app.put("/:template/reorder/", {
		preValidation: [_app.authentication],
		schema: {
			params: {
				type: "object",
				properties: {
					template: { type: "string", pattern: "^[a-f0-9]{24}$" }
				}
			},
			body: {
				type: "array",
				contains: { type: "string", pattern: "^[a-f0-9]{24}$" }
			}
		}
	}, async (_request, _response) => {
		const templateResult = await _app.mongo.db.collection("voting.templates").findOne({ _id: new _app.mongo.ObjectId(_request.params.template), deleted: null });
		if (!templateResult) return _response.status(404).send({ message: "Template couldn't be found." });

		const roomResult = await _app.mongo.db.collection("rooms").findOne({ _id: templateResult.room, deleted: null });
		if (!roomResult) return _response.status(404).send({ message: "Room couldn't be found." });
		if (roomResult.owner.toString() !== _request.user.user) return _response.status(401).send({ message: "Template option can only be deleted by the room owner." });

		const options = [];
		_request.body.forEach((_option, _index) => {
			const optionIndex = templateResult.options.findIndex(_existingOption => _existingOption._id.toString() === _option);
			options.push(templateResult.options[optionIndex]);
		});

		let response = await _app.mongo.db.collection("voting.templates").updateOne({ _id: templateResult._id }, { $set: { options } });
		if (response.result?.ok !== 1) return _response.status(500).send({ message: "Failed to reorder the options." });

		return _response.status(200).send({ message: "Success!" });
	});

	_app.delete("/:template/option/:option", {
		preValidation: [_app.authentication],
		schema: {
			params: {
				type: "object",
				properties: {
					template: { type: "string", pattern: "^[a-f0-9]{24}$" },
					option: { type: "string", pattern: "^[a-f0-9]{24}$" }
				}
			}
		}
	}, async (_request, _response) => {
		const templateResult = await _app.mongo.db.collection("voting.templates").findOne({ _id: new _app.mongo.ObjectId(_request.params.template), deleted: null });
		if (!templateResult) return _response.status(404).send({ message: "Template couldn't be found." });

		const roomResult = await _app.mongo.db.collection("rooms").findOne({ _id: templateResult.room, deleted: null });
		if (!roomResult) return _response.status(404).send({ message: "Room couldn't be found." });
		if (roomResult.owner.toString() !== _request.user.user) return _response.status(401).send({ message: "Template option can only be deleted by the room owner." });

		let response = await _app.mongo.db.collection("voting.templates").updateOne({ _id: templateResult._id }, { $pull: { options: { _id: new _app.mongo.ObjectId(_request.params.option) } } });
		if (response.result?.ok !== 1) return _response.status(500).send({ message: "Failed to update the option." });

		return _response.status(200).send({ message: "Success!" });
	});

	_app.delete("/:id", {
		preValidation: [_app.authentication],
		schema: {
			params: {
				type: "object",
				properties: {
					id: { type: "string", pattern: "^[a-f0-9]{24}$" }
				}
			}
		}
	}, async (_request, _response) => {
		const templateResult = await _app.mongo.db.collection("voting.templates").findOne({ _id: new _app.mongo.ObjectId(_request.params.id), deleted: null });
		if (!templateResult) return _response.status(404).send({ message: "Template couldn't be found." });

		const roomResult = await _app.mongo.db.collection("rooms").findOne({ _id: templateResult.room, deleted: null });
		if (!roomResult) return _response.status(404).send({ message: "Room couldn't be found." });
		if (roomResult.owner.toString() !== _request.user.user) return _response.status(401).send({ message: "Template can only be deleted by the room owner." });

		let response = await _app.mongo.db.collection("voting.templates").updateOne({ _id: templateResult._id }, { $set: { deleted: new Date() } });
		if (response.result?.ok !== 1) return _response.status(500).send({ message: "Failed to delete the template." });

		return _response.status(200).send({ message: "Success!" });
	});
};