export default {
	collection: "voting.sessions.votes",
	schema: {
		type: "object",
		properties: {
			_id: { type: "object", default: null },
			session: { type: "object" },
			voter: { type: "object" },
			option: {
				type: "object",
				properties: {
					_id: { type: "object" },
					label: { type: "string" }
				}
			},
			registered: { type: ["object"] },
			deleted: { type: ["object", "null"], default: null }
		}
	},
	documents: [
	],
	indexes: [
	]
}