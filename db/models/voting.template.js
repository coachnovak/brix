export default {
	collection: "voting.templates",
	schema: {
		type: "object",
		properties: {
			_id: { type: "object", default: null },
			room: { type: "object" },
			name: { type: "string" },
			options: {
				type: "object",
				properties: {
					_id: { type: "object" },
					label: { type: "string" }
				}
			},
			expires: { type: ["object", "null"], default: null },
			begun: { type: ["object", "null"], default: null },
			ended: { type: ["object", "null"], default: null },
			deleted: { type: ["object", "null"], default: null }
		}
	},
	documents: [
	],
	indexes: [
	]
}