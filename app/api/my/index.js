export default async (_app, _options) => {
	_app.register(await import("./invites.js"), { prefix: "invites" });
};