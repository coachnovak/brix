export default {
	name: "events",
	schema: {
		type: "object",
		properties: {
			_id: { type: "object", default: null },
			token: { type: "string" },
			room: { type: "object" },
			user: { type: "object" },
			name: { type: "string" },
			data: { type: ["object", "null"], default: null },
			when: { type: "object" },
			deleted: { type: ["object", "null"], default: null }
		}
	},
	data: [
	]
}