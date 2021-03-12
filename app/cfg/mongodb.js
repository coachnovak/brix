import MongoDB from "mongodb";

(async () => {
	try {
		const client = await MongoDB.MongoClient.connect(process.env.mongourl)
		console.info("Connected to mongodb.");
		client.close();

	} catch {
		console.log("Failed to connect to mongodb.");

	}
})();

export const mongodb = {
	url: process.env.mongourl,
	forceClose: true
};