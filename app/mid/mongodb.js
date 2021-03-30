import fastifyPlugin from "fastify-plugin";
import MongoDB from "mongodb";

export default fastifyPlugin (async (_app, _options) => {
	try {
		const client = await MongoDB.MongoClient.connect(process.env.mongourl, { useUnifiedTopology: true });
		const mongo = { objectid: MongoDB.ObjectId, storage: MongoDB.GridFSBucket, client };

		// Notify progress.
		console.info("Connected to mongodb.");

		// Extract database name, which is required.
		const urlTokens = /\w\/([^?]*)/g.exec(process.env.mongourl);
		const dbName = urlTokens && urlTokens[1];
		if (dbName) mongo.db = client.db(dbName);

		// Decorate with mongodb.
		_app.decorate("mongo", mongo);

	} catch {
		console.log("Failed to connect to mongodb.");

	}
});