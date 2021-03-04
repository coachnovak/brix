export const pubsub = {
	redis: {
		url: process.env.pubsub,
		options: {
			enableOfflineQueue: true
		}
	}
};