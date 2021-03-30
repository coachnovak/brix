export default async (_app, _options) => {
	_app.register(await import("./credentials.js"), { prefix: "credentials" });
	_app.register(await import("./invites.js"), { prefix: "invites" });
	_app.register(await import("./identity.js"), { prefix: "identity" });
	_app.register(await import("./profile.js"), { prefix: "profile" });
	_app.register(await import("./avatar.js"), { prefix: "avatar" });
	_app.register(await import("./cover.js"), { prefix: "cover" });
};