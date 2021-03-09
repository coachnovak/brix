import fastifyPlugin from "fastify-plugin";

export default fastifyPlugin (async (_app, _options) => {
	_app.register(import("./definition.js"));
	_app.register(import("./pubsub.js"));
	_app.register(import("./authentication.js"));
	_app.register(import("./emailing.js"));
});