export const docs = {
	routePrefix: "/docs",
	swagger: {
		info: {
			title: "brix swagger",
			description: "api documentation",
			version: "1.0.0"
		},
		host: "brix.party",
		schemes: ["http"],
		consumes: ["application/json"],
		produces: ["application/json"]
	},
	exposeRoute: true
};