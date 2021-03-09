import configurations from "./cfg/index.js";
import fastify from "fastify";

const app = fastify(configurations.fastify);

app.register(import("fastify-swagger"), configurations.docs);
app.register(import("fastify-mongodb"), configurations.mongodb);
app.register(import("fastify-redis-channels"), configurations.pubsub);
app.register(import("fastify-static"), configurations.ui);
app.register(import("fastify-static"), configurations.letsencrypt);
app.register(import("fastify-websocket"), configurations.sck);
app.register(import("fastify-jwt"), configurations.jwt);
app.register(import("fastify-metrics"), configurations.stats);

app.register(import("./mid/index.js"));
app.register(import("./api/index.js"));
app.register(import("./sck/index.js"));

app.ready(() => app.listen(process.env.webport, "0.0.0.0", (_error, _address) => {
	if (_error) {
		console.error(`Server failed to boot, we got: ${_error}`);
		process.exit(1);
	} else {
		console.log(`Server is up and listening on: ${_address}`);
	}
}));