export default {
	collection: "roshambo.sessions",
	schema: {
		type: "object",
		properties: {
			_id: { type: "object", default: null },
			room: { type: "object" },
			initiator: { type: "object" },
			opponent: { type: "object" },
			result: {
				type: "array",
				items: {
					type: "object"
				}
			},
			created: { type: ["object"] },
			deleted: { type: ["object", "null"], default: null }
		}
	},
	documents: [
	],
	indexes: [
	]
}