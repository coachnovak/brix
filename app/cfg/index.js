import { fastify } from "./fastify.js";
import { docs } from "./docs.js";
import { mongodb } from "./mongodb.js";
import { redis } from "./redis.js";
import { ui } from "./ui.js";
import { sck } from "./sck.js";
import { jwt } from "./jwt.js";
import { stats } from "./stats.js";
import { letsencrypt } from "./letsencrypt.js"

export default {
	fastify,
	docs,
	mongodb,
	redis,
	ui,
	sck,
	jwt,
	stats,
	letsencrypt
}