import configurations from "./configurations/index.js";
import fastify from "fastify";
import fs from "fs";

// Read definition.
const definition = JSON.parse(fs.readFileSync("./package.json"));

// Run app server.
const app = fastify(configurations.fastify);
app.ready(() => console.log("Server is up and running."));
app.decorate("definition", definition);

// Register node modules.
app.register(import("fastify-swagger"), configurations.docs);
app.register(import("fastify-mongodb"), configurations.mongodb);
app.register(import("fastify-redis-channels"), configurations.pubsub);
app.register(import("fastify-redis"), configurations.redis);
app.register(import("fastify-static"), configurations.ui);
app.register(import("fastify-static"), configurations.letsencrypt);
app.register(import("fastify-websocket"), configurations.sck);
app.register(import("fastify-jwt"), configurations.jwt);
app.register(import("fastify-metrics"), configurations.stats);

// Register middleware.
app.register(import("./middleware/authentication.js"));
app.register(import("./middleware/emailing.js"));

// Register api routes.
app.register(import("./api/app.js"), { prefix: "api/app" });
app.register(import("./api/security.js"), { prefix: "api/security" });
app.register(import("./api/participant.js"), { prefix: "api/participant" });
app.register(import("./api/participants.js"), { prefix: "api/participants" });
app.register(import("./api/room.js"), { prefix: "api/room" });
app.register(import("./api/room-invites.js"), { prefix: "api/room/invites" });
app.register(import("./api/rooms.js"), { prefix: "api/rooms" });
app.register(import("./api/comments.js"), { prefix: "api/comments" });
app.register(import("./api/events.js"), { prefix: "api/events" });
app.register(import("./api/my-invites.js"), { prefix: "api/my/invites" });

// Register sck routes.
app.register(import("./sck/room.js"), { prefix: "sck" });

// Listen for requests.
app.listen(process.env.webport, "0.0.0.0");