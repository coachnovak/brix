export default async (_app, _options) => {
	_app.register(await import("./avatar.js"), { prefix: "avatar" });
	_app.register(await import("./cover.js"), { prefix: "cover" });
};