import fastifyPlugin from "fastify-plugin";

export default fastifyPlugin (async (_app, _options) => {
	_app.register(import("./presence.js"), { prefix: "sck/presence" });
	_app.register(import("./stream.js"), { prefix: "sck/stream" });
});