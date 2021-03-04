import db from "../../db/index.js";

export default async (_app, _options) => {
	_app.get("/setup/:admincode", async (_request, _response) => {
		if (process.env.admincode !== _request?.params?.admincode)
			return _response.status(401).send({ message: "Invalid admin code security code provided." });

		const log = [];
		const existingCollections = (await _app.mongo.db
			.listCollections()
			.toArray()).map(_collection => _collection.name);

		for (let modelKey in db.models) {
			const model = db.models[modelKey];

			if (!existingCollections.includes(model.collection)) {
				_app.mongo.db.createCollection(model.collection);
				log.push({ message: `Collection '${model.collection}' was created.` });

				_app.mongo.db.collection(model.collection).insertMany(model.documents, { ordered: true });
				log.push({ message: `Collection '${model.collection}' was populated with ${model.documents.length} documents.` });

				model.indexes.forEach(_index => {
					_app.mongo.db.collection(model.collection).createIndex(_index.keys, _index.options);
					log.push({ message: `Index '${_index.options.name}' was created.` });
				});
			}
		}

		_response.status(200).send(log);
	});
};