import path from "path";

export const letsencrypt = {
	root: path.resolve(process.env.certs),
	prefix: "/letsencrypt/",
	decorateReply: false
};