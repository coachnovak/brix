export default {
	collection: "sessions",
	schema: {
		type: "object",
		properties: {
			_id: { type: "object", default: null },
			user: { type: "object" },
			token: { type: "string" },
			salt: { type: "string" }
		}
	},
	documents: [
	],
	indexes: [
	]
}