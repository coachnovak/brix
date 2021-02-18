export const redis = {
	redis: {
		url: process.env.redisurl,
		options: {
			enableOfflineQueue: true
		}
	}
};