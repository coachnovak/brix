import anime from "/assets/scripts/anime.es.js";
import { component } from "/components/component.js";
import { loader } from "/components/loader.js";
import { progress } from "/components/progress.js";

export class notification extends component {
	constructor (_properties = {}) {
		super({ ..._properties });

		const { contents, composition } = _properties;
		this.property({ name: "contents", value: contents, options: { default: [] } })
			.property({ name: "composition", value: composition, options: { default: null, isattribute: true } });
    }

	connectedCallback ({ style, markup } = {}) {
		super.conditionsCallback();
		super.connectedCallback({
			style: component.template`
				:host { display: grid; grid-gap: var(--spacing); padding: var(--spacing); align-items: center; }
				:host { background: var(--paper-2); color: var(--pen-1); box-shadow: var(--paper-s); }
				:host { opacity: 0; transform: translateY(100%); }

				#text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
				app-progress { grid-column: 1 / -1; }

				${style ? style() : ""}
			`,

			markup: component.template`

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
		const composition = [];
		this.contents.forEach(_content => {
			if (_content.icon !== undefined) {
				composition.push("min-content");

				const iconElement = this.append(document.createElement("i"));
				iconElement.classList.add(`fad`, `fa-${_content.icon}`);
			} else if (_content.text !== undefined) {
				composition.push("auto");

				const textElement = this.append(document.createElement("div"));
				textElement.setAttribute("id", "text");
				textElement.innerHTML = _content.text;
			} else if (_content.loader !== undefined) {
				composition.push("min-content");
				this.append(new loader(_content.loader));
			} else if (_content.progress !== undefined) {
				this.append(new progress(_content.progress));
			}
		});

		this.find("style").innerHTML += `:host { grid-template-columns: ${composition.join(" ")}; }`;
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