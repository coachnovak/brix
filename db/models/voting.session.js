export default {
	collection: "voting.sessions",
	schema: {
		type: "object",
		properties: {
			_id: { type: "object", default: null },
			room: { type: "object" },
			initiator: { type: "object" },
			topic: { type: "string" },
			options: {
				type: "object",
				properties: {
					_id: { type: "object" },
					label: { type: "string" }
				}
			},
			begun: { type: ["object", "null"], default: null },
			ended: { type: ["object", "null"], default: null },
			created: { type: ["object"] },
			deleted: { type: ["object", "null"], default: null }
		}
	},
	documents: [
	],
	indexes: [
	]
}