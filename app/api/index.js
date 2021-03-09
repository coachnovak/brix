import fastifyPlugin from "fastify-plugin";

export default fastifyPlugin (async (_app, _options) => {
	_app.register(import("./my/index.js"), { prefix: "api/my" });
	_app.register(import("./voting/index.js"), { prefix: "api/voting" });

	_app.register(import("./db.js"), { prefix: "api/db" });
	_app.register(import("./app.js"), { prefix: "api/app" });
	_app.register(import("./security.js"), { prefix: "api/security" });
	_app.register(import("./participant.js"), { prefix: "api/participant" });
	_app.register(import("./participants.js"), { prefix: "api/participants" });
	_app.register(import("./room.js"), { prefix: "api/room" });
	_app.register(import("./room-invites.js"), { prefix: "api/room/invites" });
	_app.register(import("./rooms.js"), { prefix: "api/rooms" });
	_app.register(import("./comments.js"), { prefix: "api/comments" });
	_app.register(import("./events.js"), { prefix: "api/events" });
});