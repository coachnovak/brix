import stream from "/components/stream.js";
import { article } from "/components/article.js";
import { shadow } from "/components/shadow.js";
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
			globalThis.notify({ icon: "shield-alt", text: "Access to the requested operation denied." });
			break;

		case 400:
		case 500:
			const serverError = await response.json();
			globalThis.notify({ icon: "exclamation-triangle", text: serverError.message });
			break;

	}

	return response;
};

globalThis.contents = {
	open: (_article) => {
		const contents = document.getElementById("contents");
		const newarticle = new article({
			name: _article.name,
			parameters: _article.parameters || {}
		});

		contents.appendChild(newarticle);
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
			if (_article.name === _name) close = true;
			else if (close === true) _article.close();
		});
	}
};

globalThis.windows = {
	open: (_article, _options = {}) => {
		const windows = document.getElementById("windows");
		const shadowElement = windows.appendChild(new shadow());

		return windows.appendChild(new article({
			name: _article.name,
			parameters: _article.parameters || {},
			shadow: shadowElement
		}));
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
	globalThis.once = (_name, _function) => document.addEventListener(_name, _function, { once: true });
	globalThis.off = (_name, _function) => document.removeEventListener(_name, _function);

	// Setup event stream.
	globalThis.stream = new stream();

	const signOut = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("expires");

		globalThis.emit("security.signedout");
		globalThis.contents.close();
		globalThis.contents.open({ name: "doormat" });
	};

	const verifySessionExpiration = () => {
		const expiresInStore = localStorage.getItem("expires");
		const tokenInStore = localStorage.getItem("token");
		
		if (expiresInStore) {
			const expires = new Date(expiresInStore);
			const now = new Date();
			if (expires < now) signOut();
		} else if (tokenInStore) {
			// No session, yet token exists.
			localStorage.removeItem("token");
		}
	};

	verifySessionExpiration();
	setInterval(verifySessionExpiration, 3000);

	document.getElementById("button.home").on("activated", () => {
		let tokenInStore = localStorage.getItem("token");

		globalThis.contents.close();
		if (tokenInStore) globalThis.contents.open({ name: "rooms" });
		else globalThis.contents.open({ name: "doormat" });
	});

	document.getElementById("button.signin").on("activated", () => {
		globalThis.windows.open({ name: "signin" });
	});

	document.getElementById("button.signout").on("activated", () => signOut());

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

	// Emit initial session state.
	let tokenInStore = localStorage.getItem("token");
	globalThis.emit(tokenInStore ? "security.signedin" : "security.signedout");

	// Open first article.
	if (tokenInStore) globalThis.contents.open({ name: "rooms" });
	else globalThis.contents.open({ name: "doormat" });
});