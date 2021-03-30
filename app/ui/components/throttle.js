export default class {
	static setup (_function, _time = 50) {
		let timeout, lastRan;

		return (...args) => {
			const context = this;

			if (!lastRan) {
				_function.apply(context, args);
				lastRan = Date.now();
			} else {
				clearTimeout(timeout);
				timeout = setTimeout(() => {
					if ((Date.now() - lastRan) >= _time) {
						_function.apply(context, args);
						lastRan = Date.now();
					}
				}, _time - (Date.now() - lastRan));
			}
		}
	}
}