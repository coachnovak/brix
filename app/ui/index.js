import events from "/components/events.js";
import stream from "/components/stream.js";
import session from "/components/session.js";
import keyboard from "/components/keyboard.js";

import { article } from "/components/article.js";
import { shadow } from "/components/shadow.js";
import { button } from "/components/button.js";
import { notifications } from "/components/notifications.js";

globalThis.fetcher = async (_url, _options = {}, _status = {}) => {
	if (!_options.headers) _options.headers = {};
	_options.headers["Content-Type"] = "application/json";

	if (globalThis.session.signedin)
		_options.headers["Authorization"] = `Bearer ${globalThis.session.token}`;

	const response = await fetch(_url, _options);

	if (_status[response.status])
		return _status[response.status](response);

	switch (response.status) {
		case 401:
			if (_status["401"]) return _status["401"]();
			globalThis.notify([{ icon: "shield-alt" }, { text: "Access to the requested operation denied." }]).close(3000);
			break;
	
		case 400:
			if (_status["400"]) return _status["400"]();

		case 500:
			const serverError = await response.json();
			globalThis.notify([{ icon: "exclamation-triangle" }, { text: serverError.message }]).close(3000);
			break;
	}

	return response;
};

globalThis.uploader = async (_url, _options = {}, _status = {}, _progress) => {
	const xhr = new XMLHttpRequest();
	xhr.open(_options.method, _url);

	if (globalThis.session.signedin)
		xhr.setRequestHeader("Authorization", `Bearer ${globalThis.session.token}`);

	xhr.onreadystatechange = () => {
		if (xhr.readyState == 4) {
			if (_status[xhr.status])
				return _status[xhr.status](JSON.parse(xhr.response));
		}
	};
	
	xhr.upload.onerror = _error => {
		debugger
		return _status[xhr.status](JSON.parse(xhr.responseText));
	};

	xhr.upload.onabort = () => {

	};

	xhr.upload.onprogress = _event => {
		if (_progress) _progress({ sent: _event.loaded, total: _event.total });
	}

	xhr.send(_options.body);
};

globalThis.contents = {
	open: (_article) => {
		const contents = document.getElementById("contents");
		return contents.appendChild(new article({
			name: _article.name,
			parameters: _article.parameters || {},
			type: "content"
		}));
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

		return globalThis.contents;
	},

	cut: (_name) => {
		const contents = document.getElementById("contents");
		const articles = Array.from(contents.children);

		let close = false;
		articles.forEach(_article => {
			if (_article.name === _name) close = true;
			else if (close === true) _article.close("closed");
		});
	}
};

globalThis.windows = {
	open: (_article, _options = {}) => {
		const windows = document.getElementById("windows");

		return windows.appendChild(new article({
			name: _article.name,
			parameters: _article.parameters || {},
			type: "window",
			shadow: windows.appendChild(new shadow())
		}));
	},

	close: (_name = null) => {
		const windows = document.getElementById("windows");
		const oldarticles = Array.from(windows.children).reverse();
		oldarticles.forEach(_article => {
			let close = true;

			if (_name instanceof Array) {
				if (!_name.includes(_article.name)) close = false;
			} else if (_name !== null) {
				if (_name !== _article.name) close = false;
			}

			if (close && _article.close) _article.close("closed");
		});

		return globalThis.windows;
	},

	list: () => {
		const articles = document.querySelectorAll("#windows > app-article");
		return articles;
	}
};

globalThis.notify = (_contents) => {
	return document.getElementById("notifications").push(_contents);
};

document.addEventListener("DOMContentLoaded", async () => {
	globalThis.emit = (_name, _data) => document.dispatchEvent(new CustomEvent(_name, { detail: _data }));
	globalThis.on = (_name, _function) => document.addEventListener(_name, _function);
	globalThis.once = (_name, _function) => document.addEventListener(_name, _function, { once: true });
	globalThis.off = (_name, _function) => document.removeEventListener(_name, _function);

	globalThis.events = new events();
	globalThis.session = new session();
	globalThis.stream = new stream();
	globalThis.keyboard = new keyboard();

	// Initiate session evaluation.
	await globalThis.session.evaluate();

	// Open landing article.
	globalThis.contents.open({ name: globalThis.session.signedin ? "rooms/list" : "doormat" });

	// Redirect events.
	globalThis.events.redirect(document, "mousedown");
	globalThis.events.redirect(document, "mouseup");
	globalThis.events.redirect(document, "touchstart");
	globalThis.events.redirect(document, "touchend");
	globalThis.events.redirect(document, "keydown");
	globalThis.events.redirect(document, "keyup");

	document.getElementById("home").events.on("activated", () => {
		globalThis.contents.close();

		if (globalThis.session.signedin)
			globalThis.contents.open({ name: "rooms/list" });
		else
			globalThis.contents.open({ name: "doormat" });
	});

	document.getElementById("search").events.on("activated", () => {
		globalThis.windows.open({ name: "query" });
	});

	document.getElementById("signin").events.on("activated", () => {
		globalThis.windows.open({ name: "signin" });
	});

	document.getElementById("profile").events.on("activated", () => {
		globalThis.windows.open({ name: "my/profile" });
	});

	// Set initial state on session buttons.
	document.getElementById("signin").visible = globalThis.session.signedin === false;
	document.getElementById("search").visible = globalThis.session.signedin === true;
	document.getElementById("profile").visible = globalThis.session.signedin === true;

	// Handle signedin and signedout events.
	globalThis.session.events.on("signedin", () => {
		document.getElementById("signin").visible = false;
		document.getElementById("search").visible = true;
		document.getElementById("profile").visible = true;
	});

	globalThis.session.events.on("signedout", () => {
		document.getElementById("signin").visible = true;
		document.getElementById("search").visible = false;
		document.getElementById("profile").visible = false;

		// Reopen landing article.
		globalThis.contents.close();
		globalThis.contents.open({ name: "doormat" });

		// Close all windows.
		globalThis.windows.list().forEach(_window => _window.close("cancelled"));
	});
});