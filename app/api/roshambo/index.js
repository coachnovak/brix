export default async (_app, _options) => {
	_app.register(await import("./session.js"), { prefix: "session" });
	_app.register(await import("./sessions.js"), { prefix: "sessions" });
};