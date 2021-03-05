export default {
	collection: "voting.sessions.participants",
	schema: {
		type: "object",
		properties: {
			_id: { type: "object", default: null },
			session: { type: "object" },
			voter: { type: "object" },
			heartbeat: { type: ["object", "null"], default: null },
			deleted: { type: ["object", "null"], default: null }
		}
	},
	documents: [
	],
	indexes: [
		{ keys: { heartbeat: 1 }, options: { name: "heartbeat", expireAfterSeconds: 30 } }
	]
}