import { component } from "/components/component.js";
import { avatar } from "/components/avatar.js";
import { loader } from "/components/loader.js";
import { progress } from "/components/progress.js";

export class listitem extends component {
	constructor (_properties = {}) {
		const { clickable = true, contents, data } = _properties;
		super({ ..._properties, canfocus: clickable });

		this.property({ name: "clickable", value: clickable, options: { default: true, isattribute: true } })
			.property({ name: "contents", value: contents, options: { default: [] } })
			.property({ name: "data", value: data, options: { default: null } });
    }

	connectedCallback ({ style, markup } = {}) {
		super.conditionsCallback();
		super.connectedCallback({
			style: component.template`
				:host { overflow: hidden; }

				#container { display: grid; grid-gap: calc(var(--spacing) / 1.5); padding: calc(var(--spacing) / 1.5); align-items: center; border-radius: 3px; }
				:host([clickable="true"]:hover) #container { background: var(--action-e-2); cursor: pointer; }

				#avatar { position: relative; width: 34px; height: 34px; border-radius: 50%; background: var(--paper-3); }
				#avatar i { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); }
		
				#text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
				#since { white-space: nowrap; }
				#until { white-space: nowrap; }
				#count { white-space: nowrap; opacity: 0.5; }

				${style ? style() : ""}
			`,

			markup: component.template`
				<div id="container"></div>

				${markup ? markup() : ""}
			`
		});

		// Initial render.
		this.render();

		// Redirect events.
		this.events.redirect(this, "click");
		this.events.redirect(this, "keydown");

		// Handle events.
		this.events.on("click", _event => this.events.emit("activated", { id: this.id, data: this.data }));
		this.events.on("keydown", _event => _event.key === "Enter" && this.events.emit("activated", { id: this.id, data: this.data }));
		this.events.on("clickable updated", _value => this.canfocus = _value);
	}

	disconnectedCallback () {
		super.disconnectedCallback();
	}

	render () {
		const template = [];
		const containerElement = this.find("#container");
		containerElement.innerHTML = "";

		// Build template and elements.
		this.contents.forEach(_content => {
			if (_content.avatar !== undefined) {
				containerElement.appendChild(new avatar(_content.avatar));
				template.push("min-content");
			} else if (_content.icon !== undefined) {
				containerElement.appendChild(document.createElement("i")).classList.add(`fad`, `fa-${_content.icon}`);
				template.push("min-content");
			} else if (_content.text !== undefined) {
				const textElement = containerElement.appendChild(document.createElement("div"));
				textElement.setAttribute("id", "text");
				textElement.innerHTML = _content.text;

				template.push("auto");
			} else if (_content.arrow !== undefined) {
				containerElement.appendChild(document.createElement("i")).classList.add(`fad`, `fa-arrow-right`);
				template.push("min-content");
			} else if (_content.delete !== undefined) {
				containerElement.appendChild(document.createElement("i")).classList.add(`fad`, `fa-times`);
				template.push("min-content");
			} else if (_content.since !== undefined) {
				const sinceElement = containerElement.appendChild(document.createElement("div"));
				sinceElement.setAttribute("id", "since");
				sinceElement.setAttribute("datetime", "text");
				sinceElement.innerHTML = _content.since;

				template.push("min-content");

				timeago.render(sinceElement);
				this.events.on("disposed", () => timeago.cancel(sinceElement));
			} else if (_content.until !== undefined) {
				const untilContainerElement = containerElement.appendChild(document.createElement("div"));
				untilContainerElement.setAttribute("id", "until");

				if (_content.until)
					untilContainerElement.innerHTML = `expires <span datetime="${_content.until}"></span>`;
				else
					untilContainerElement.innerHTML = `won't expire`;

				template.push("min-content");

				const untilElement = this.find("#until > span");
				if (!untilElement) return;

				timeago.render(untilElement);
				this.events.on("disposed", () => timeago.cancel(untilElement));
			} else if (_content.count !== undefined) {
				const countElement = containerElement.appendChild(document.createElement("div"));
				countElement.setAttribute("id", "count");
				countElement.innerHTML = _content.count;

				template.push("min-content");
			} else if (_content.loader !== undefined) {
				containerElement.appendChild(new loader(_content.loader));
				template.push("min-content");
			} else if (_content.progress !== undefined) {
				containerElement.appendChild(new progress(_content.progress));
			}
		});

		// Apply columns template.
		containerElement.style.gridTemplateColumns = template.join(" ");
	}
}

globalThis.customElements.define("app-listitem", listitem);