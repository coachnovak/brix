export default class {
	constructor (_room) {
		this.socket = null;
		this.sleep = 2000;
		this.hasleft = false;
		this.room = _room;

		const protocol = window.location.protocol;
		const host = window.location.host.split(":");
		const token = localStorage.getItem("token");
		
		if (!token) {
			// No session token found.
			this.hasleft = true;
			return;
		}

		this.url = `${protocol === "https:" ? "wss" : "ws"}://${host.join(":")}/sck/presence/`
		this.join();
	}

	join () {
		this.socket = new WebSocket(this.url);
		this.socket.onopen = () => {
			this.socket.send(JSON.stringify({ join: this.room, token: localStorage.getItem("token") }));
		};
		this.socket.onclose = () => {
			setTimeout(() => this.rejoin(), this.sleep)
		};
		this.socket.onerror = _info => this.rejoin();
		this.socket.onmessage = _message => {
			const { code, message, when } = JSON.parse(_message.data);

			switch (code) {
				case 200:
					if (this.heartbeat) return;
					this.heartbeat = setInterval(() => this.socket.send(JSON.stringify({ alive: true })), 4000);
					break;

				case 500:
					globalThis.notify({ icon: "exclamation-triangle", text: message });
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