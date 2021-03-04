import configurations from "./cfg/index.js";
import fastify from "fastify";
import fs from "fs";

const boot = async () => {
	// Read definition.
	const definition = JSON.parse(fs.readFileSync("./package.json"));

	// Run app server.
	const app = fastify(configurations.fastify);
	app.decorate("definition", definition);

	// Register node modules.
	app.register(await import("fastify-swagger"), configurations.docs);
	app.register(await import("fastify-mongodb"), configurations.mongodb);
	app.register(await import("fastify-redis-channels"), configurations.pubsub);
	app.register(await import("fastify-redis"), configurations.redis);
	app.register(await import("fastify-static"), configurations.ui);
	app.register(await import("fastify-static"), configurations.letsencrypt);
	app.register(await import("fastify-websocket"), configurations.sck);
	app.register(await import("fastify-jwt"), configurations.jwt);
	app.register(await import("fastify-metrics"), configurations.stats);

	// Register middleware.
	app.register(await import("./mid/authentication.js"));
	app.register(await import("./mid/emailing.js"));

	// Register api routes.
	app.register(await import("./api/db.js"), { prefix: "api/db" });
	app.register(await import("./api/app.js"), { prefix: "api/app" });
	app.register(await import("./api/security.js"), { prefix: "api/security" });
	app.register(await import("./api/participant.js"), { prefix: "api/participant" });
	app.register(await import("./api/participants.js"), { prefix: "api/participants" });
	app.register(await import("./api/room.js"), { prefix: "api/room" });
	app.register(await import("./api/room-invites.js"), { prefix: "api/room/invites" });
	app.register(await import("./api/rooms.js"), { prefix: "api/rooms" });
	app.register(await import("./api/comments.js"), { prefix: "api/comments" });
	app.register(await import("./api/events.js"), { prefix: "api/events" });
	app.register(await import("./api/my-invites.js"), { prefix: "api/my/invites" });

	// Register sck routes.
	app.register(await import("./sck/room.js"), { prefix: "sck" });

	// Listen for requests.
	app.ready(() => {
		console.log(`Server booted with the following route setup.`);
		console.log(app.printRoutes());
		console.log();

		app.listen(process.env.webport, "0.0.0.0", (_error, _address) => {
			if (_error) {
				console.error(`Server failed to boot, we got: ${_error}`);
				process.exit(1);
			} else {
				console.log(`Server is up and listening on ${_address}.`);
			}
		});
	});
};

// Start booting the server.
setTimeout(boot, process.env.production === "true" ? 1 : 6000);