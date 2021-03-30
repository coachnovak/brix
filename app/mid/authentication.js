import fastifyPlugin from "fastify-plugin";

export default fastifyPlugin (async (_app, _options) => {
	_app.decorate("authentication", async (_request, _response) => {
		try {
			const result = await _request.jwtVerify();
			const session = await _app.mongo.db.collection("sessions").findOne({ salt: result.salt });
			if (!session) _response.status(401).send("Session has been deemed unauthorized.");

		} catch {
			_response.status(401).send("Access token couldn't be verified.");

		}

	});
});