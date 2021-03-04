export default {
	collection: "invites",
	schema: {
		type: "object",
		properties: {
			_id: { type: "object", default: null },
			room: {
				type: "object",
				properties: {
					_id: { type: "object", default: null },
					name: { type: "string" }
				}
			},
			sender: {
				type: "object",
				properties: {
					_id: { type: "object" },
					firstName: { type: "string" },
					lastName: { type: "string" }
				}
			},
			recipient: {
				type: "object",
				properties: {
					_id: { type: "object" },
					firstName: { type: "string" },
					lastName: { type: "string" }
				}
			},
			expires: { type: ["object", "null"], default: null },
			deleted: { type: ["object", "null"], default: null },
			created: { type: "object" }
		}
	},
	documents: [
	],
	indexes: [
	]
}