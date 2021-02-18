import socket from "/components/socket.js";

import { article } from "/components/article.js";
import { identity } from "/components/identity.js";
import { button } from "/components/button.js";
import { notifications } from "/components/notifications.js";

globalThis.fetcher = async (_url, _options = {}) => {
	if (!_options.headers) _options.headers = {};
	_options.headers["Content-Type"] = "application/json";

	if (localStorage.getItem("token"))
		_options.headers["Authorization"] = `Bearer ${localStorage.getItem("token")}`;

	const response = await fetch(_url, _options);

	switch (response.status) {
		case 401:
			localStorage.removeItem("token");
			globalThis.emit("security.signedout");
			globalThis.notify({ icon: "shield-alt", text: "Access to the requested information denied." });
			break;

		case 500:
			globalThis.notify({ icon: "exclamation-triangle", text: response.text() });
			break;

	}

	return response;
};

globalThis.article = {
	open: (_article, _options = {}) => {
		if (!(_article instanceof Array))
			_article = [_article];

		if (_options.reset) globalThis.article.close();
		const contents = document.getElementById("contents");
		const oldarticles = Array.from(contents.children).reverse();

		_article.forEach(_newarticle => {
			if (_newarticle.unique === true) {
				let discontinue = false;
				oldarticles.forEach(_oldarticle => {
					if (discontinue === true) return;
					discontinue = _newarticle.name === _oldarticle.name;
				});

				if (discontinue) return;
			}

			const newarticle = new article({
				name: _newarticle.name,
				parameters: _newarticle.parameters ? _newarticle.parameters : {}
			});

			if (_options.priority)
				contents.prepend(newarticle);
			else
				contents.appendChild(newarticle);
		});
	},

	find: (_name) => {
		const contents = document.getElementById("contents");
		const articles = Array.from(contents.children);
		return articles.find(_article => _article.name === _name);
	},

	close: (_name = null) => {
		const contents = document.getElementById("contents");
		const oldarticles = Array.from(contents.children).reverse();
		oldarticles.forEach(_article => {
			let close = true;

			if (_name instanceof Array) {
				if (!_name.includes(_article.name)) close = false;
			} else if (_name !== null) {
				if (_name !== _article.name) close = false;
			}

			if (close && _article.close) _article.close();
		});
	},

	cut: (_name) => {
		const contents = document.getElementById("contents");
		const articles = Array.from(contents.children);

		let close = false;
		articles.forEach(_article => {
			if (_article.name === _name)
				close = true;
			else if (close === true)
				_article.close();
		});
	}
};

globalThis.notify = ({ text, icon = "info-circle" }) => {
	document.getElementById("notifications").push({ text, icon });
	window.scrollTo(0, document.body.scrollHeight);
};

document.addEventListener("DOMContentLoaded", () => {
	// Setup event quick access
	globalThis.emit = (_name, _data) => document.dispatchEvent(new CustomEvent(_name, { detail: _data }));
	globalThis.on = (_name, _function) => document.addEventListener(_name, _function);
	globalThis.off = (_name, _function) => document.removeEventListener(_name, _function);

	document.getElementById("button.home").on("activated", () => {
		const token = localStorage.getItem("token");
		if (token) globalThis.article.open([{ name: "rooms" }], { reset: true });
		else globalThis.article.open([{ name: "doormat" }], { reset: true });
	});

	document.getElementById("button.signin").on("activated", () => {
		globalThis.article.open([{ name: "signin" }], { reset: true });
	});

	document.getElementById("button.signout").on("activated", () => {
		localStorage.removeItem("token");
		globalThis.emit("security.signedout");

		globalThis.article.open([{ name: "doormat" }], { reset: true });
	});

	// Handle signed in and signed out.
	globalThis.on("security.signedin", _info => {
		document.getElementById("button.signin").visible = false;
		document.getElementById("button.signout").visible = true;
		document.getElementById("identity").refresh();
	});

	globalThis.on("security.signedout", _info => {
		document.getElementById("button.signin").visible = true;
		document.getElementById("button.signout").visible = false;
		document.getElementById("identity").refresh();
	});

	// // Connect to event stream
	// const eventStream = new socket(`ws://${window.location.host}/sck/events/`);

	// eventStream.on("open", async () => {

	// });

	// eventStream.on("close", async _info => {

	// });

	// eventStream.on("message", async _message => {
	// 	const message = JSON.parse(_message.data);
	// 	globalThis.emit(message.name, { detail: message.info });

	// 	console.info(message);
	// });

	// eventStream.connect();

	// Emit initial session state.
	globalThis.emit(localStorage.getItem("token") ? "security.signedin" : "security.signedout");

	// Open first article.
	const token = localStorage.getItem("token");
	if (token) globalThis.article.open([{ name: "rooms" }]);
	else globalThis.article.open([{ name: "doormat" }]);
});