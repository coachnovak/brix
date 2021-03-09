import fs from "fs";
import fastifyPlugin from "fastify-plugin";

export default fastifyPlugin (async (_app, _options) => {
	const definition = JSON.parse(fs.readFileSync("./package.json"));
	_app.decorate("definition", definition);
});