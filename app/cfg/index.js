import { fastify } from "./fastify.js";
import { cors } from "./cors.js";
import { docs } from "./docs.js";
import { pubsub } from "./pubsub.js";
import { redis } from "./redis.js";
import { ui } from "./ui.js";
import { sck } from "./sck.js";
import { jwt } from "./jwt.js";
import { stats } from "./stats.js";
import { letsencrypt } from "./letsencrypt.js"
import { multipart } from "./multipart.js"

export default {
	fastify,
	cors,
	docs,
	pubsub,
	redis,
	ui,
	sck,
	jwt,
	stats,
	letsencrypt,
	multipart
}