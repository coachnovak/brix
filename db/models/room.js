export default {
	collection: "rooms",
	schema: {
		type: "object",
		properties: {
			_id: { type: "object", default: null },
			owner: { type: "object" },
			name: { type: "string" },
			alias: { type: "string" },
			tags: {
				type: "array",
				items: {
					type: "string"
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