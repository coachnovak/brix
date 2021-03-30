export default class {
	constructor (_room) {
		this.socket = null;
		this.sleep = 3000;
		this.hasleft = false;
		this.room = _room;

		const protocol = window.location.protocol;
		const host = window.location.host.split(":");
		
		if (globalThis.sessionStorage.signedin === false) {
			// Not signed in.
			this.hasleft = true;
			return;
		}

		this.url = `${protocol === "https:" ? "wss" : "ws"}://${host.join(":")}/sck/presence/`
		this.join();
	}

	join () {
		this.socket = new WebSocket(this.url);

		this.socket.onopen = () => {
			this.socket.send(JSON.stringify({ join: this.room, token: globalThis.session.token }));
		};

		this.socket.onclose = () => {
			setTimeout(() => this.rejoin(), this.sleep)
		};

		this.socket.onerror = () => {
			this.leave(true);
		};

		this.socket.onmessage = async _message => {
			const { code, message, when } = JSON.parse(_message.data);

			switch (code) {
				case 200:
					if (this.heartbeat)
						return;

					this.heartbeat = setInterval(() => {
						if (this.socket.readyState === 1)
							this.socket.send(JSON.stringify({ alive: true }))
					}, 4000);

					break;

				case 500:
					globalThis.notify([{ icon: "exclamation-triangle" }, { text: message }]).close(3000);
					break;

			}
		};
	}

	rejoin () {
		if (this.hasleft) return;

		this.leave(true);
		this.join();
	}

	leave (_rejoin) {
		if (!_rejoin)
			this.hasleft = true;

		clearTimeout(this.heartbeat);
		delete this.heartbeat;

		this.socket.close();
	}
}