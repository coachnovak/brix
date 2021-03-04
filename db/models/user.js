export default {
	collection: "users",
	schema: {
		type: "object",
		properties: {
			_id: { type: "object", default: null },
			email: { type: "string" },
			password: { type: "string" },
			salt: { type: "string" },
			firstName: { type: "string" },
			lastName: { type: "string" },
			registered: { type: ["object"] },
			confirmed: { type: ["object", "null"], default: null },
			confirmCode: { type: "string" },
			deleted: { type: ["object", "null"], default: null }
		}
	},
	documents: [
	],
	indexes: [
	]
}