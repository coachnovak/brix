export default {
	collection: "voting.sessions",
	schema: {
		type: "object",
		properties: {
			_id: { type: "object", default: null },
			room: { type: "object" },
			initiator: { type: "object" },
			topic: { type: "string" },
			participants: {
				type: "array",
				contains: { type: "object" }
			},
			options: {
				type: "object",
				properties: {
					_id: { type: "object" },
					icon: { type: "string" },
					label: { type: "string" }
				}
			},
			votes: {
				type: "array",
				contains: {
					type: "object",
					properties: {
						user: { type: "object" },
						option: { type: "object" },
						registered: { type: "object" }
					}
				}
			},
			begun: { type: ["object", "null"], default: null },
			ended: { type: ["object", "null"], default: null },
			expires: { type: ["object", "null"], default: null },
			created: { type: ["object"] },
			deleted: { type: ["object", "null"], default: null }
		}
	},
	documents: [
	],
	indexes: [
	]
}