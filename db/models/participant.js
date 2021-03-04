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
			heartbeat: { type: ["object"] },
			registered: { type: ["object"] }
		}
	},
	documents: [
	],
	indexes: [
		{ keys: { heartbeat: 1 }, options: { name: "heartbeat", expireAfterSeconds: 10 } }
	]
}