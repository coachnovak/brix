export default {
	collection: "participants",
	schema: {
		type: "object",
		properties: {
			_id: { type: "object", default: null },
			room: { type: "object" },
			user: {
				type: "object",
				properties: {
					_id: { type: "object" },
					firstName: { type: "string" },
					lastName: { type: "string" }
				}
			},
			joined: { type: ["object"] },
			heartbeat: { type: ["object"] },
			left: { type: ["object", "null"], default: null }
		}
	},
	documents: [
	],
	indexes: [
		{ keys: { heartbeat: 1 }, options: { name: "heartbeat", expireAfterSeconds: 30 } }
	]
}