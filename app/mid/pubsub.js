import ioRedis from "ioredis";
import fastifyPlugin from "fastify-plugin";

export default fastifyPlugin (async (_app, _options) => {
	const subscriptions = [];

	// Setup subscriber.
	const subscriber = new ioRedis(process.env.pubsub);
	subscriber.on("connect", async () => console.info("Connected to redis as subscriber."));
	subscriber.on("error", async () => console.error("Failed to connect to redis as subscriber."));
	subscriber.on("message", async (_channel, _message) => {
		const subscriptionsToProcess = subscriptions.filter(_subscription => _subscription.channel === _channel);
		const messageToForward = JSON.parse(_message);
		subscriptionsToProcess.forEach(_subscriptionToProcess => _subscriptionToProcess.function(_channel, messageToForward));
	});

	_app.decorate("subscribe", (_channel, _function) => {
		subscriber.subscribe(_channel);
		subscriptions.push({ channel: _channel, function: _function });

		return () => {
			// Unsubscribe from redis.
			subscriber.unsubscribe(_channel);

			// Delete from subscriptions.
			const subscriptionIndex = subscriptions.findIndex(_subscription => _subscription.channel === _channel && _subscription.function === _function);
			subscriptions.splice(subscriptionIndex, 1);
		};
	});

	// Setup publisher.
	const publisher = new ioRedis(process.env.pubsub);
	publisher.on("connect", async () => console.info("Connected to redis as publisher."));
	publisher.on("error", async () => console.error("Failed to connect to redis as publisher."));

	_app.decorate("publish", (_channel, _message) => {
		publisher.publish(_channel, JSON.stringify(_message));
	});

	// Setup stream recorder.
	await subscriber.psubscribe("*");
	subscriber.on("pmessage", async (_pattern, _channel, _message) => {
		const message = JSON.parse(_message);
		message.channel = _channel;

		_app.mongo.db.collection("events").insertOne(message);
	});
});