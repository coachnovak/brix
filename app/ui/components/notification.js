import anime from "/assets/scripts/anime.es.js";
import { component } from "/components/component.js";
import { avatar } from "/components/avatar.js";
import { loader } from "/components/loader.js";
import { progress } from "/components/progress.js";

export class notification extends component {
	constructor (_properties = {}) {
		super({ ..._properties });

		const { contents } = _properties;
		this.property({ name: "contents", value: contents, options: { default: [] } });
    }

	connectedCallback ({ style, markup } = {}) {
		super.conditionsCallback();
		super.connectedCallback({
			style: component.template`
				:host { opacity: 0; transform: translateY(100%); }

				#container { display: grid; grid-gap: var(--spacing); padding: var(--spacing); align-items: center; }
				#container { background: var(--paper-2); color: var(--pen-1); box-shadow: var(--paper-s); }

				.nowrap { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
				app-progress { grid-column: 1 / -1; }

				${style ? style() : ""}
			`,

			markup: component.template`
				<div id="container"></div>

				${markup ? markup() : ""}
			`
		});

		// Redirect events.
		/* None */

		// Handle events.
		/* None */

		// Initial render.
		this.render();

		// Animate pop.
		this.popup = anime({
			targets: this,
			duration: 800,
			translateY: ["100%", "0px"],
			opacity: [0, 1],
			easing: "easeInOutElastic(1, .5)",
			loop: false
		});
	}

	disconnectedCallback () {
		super.disconnectedCallback();
	}

	render () {
		const template = [];
		const containerElement = this.find("#container");
		containerElement.innerHTML = "";

		this.contents.forEach(_content => {
			if (_content.avatar !== undefined) {
				containerElement.appendChild(new avatar(_content.avatar));
				template.push("min-content");
			} else if (_content.icon !== undefined) {
				const iconElement = containerElement.appendChild(document.createElement("i"));
				iconElement.classList.add(`fad`, `fa-${_content.icon}`);

				template.push("min-content");
			} else if (_content.text !== undefined) {
				const textElement = containerElement.appendChild(document.createElement("div"));
				textElement.setAttribute("id", "text");
				textElement.innerHTML = _content.text;

				template.push("auto");
			} else if (_content.loader !== undefined) {
				containerElement.appendChild(new loader(_content.loader));
				template.push("min-content");
			} else if (_content.progress !== undefined) {
				containerElement.appendChild(new progress(_content.progress));
			}
		});

		// Apply columns.
		containerElement.style.gridTemplateColumns = template.join(" ");
	}

	progress (_value) {
		const progressElement = this.find("app-progress");
		progressElement.current = _value > progressElement.max ? progressElement.max : _value;
	}

	close (_ms) {
		const closeNow = () => {
			this.popup.finished.then(() => this.remove());
			this.popup.reverse();
			this.popup.play();
		};

		if (_ms) this.timers.once(_ms, () => closeNow());
		else closeNow();
	}
}

globalThis.customElements.define("app-notification", notification);