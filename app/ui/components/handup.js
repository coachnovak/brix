import anime from "/assets/scripts/anime.es.js";
import { component } from "/components/component.js";

export class handup extends component {
	constructor (_properties = {}) {
		super({ ..._properties });

		const { doer, display, position } = _properties;
		this.property({ name: "doer", value: doer, options: { default: { firstName: "John", lastName: "Doe" }, isattribute: true } })
			.property({ name: "display", value: display, options: { default: null, isattribute: true } })
			.property({ name: "position", value: position, options: { default: 50, isattribute: true } });
    }

	connectedCallback ({ style, markup } = {}) {
		super.conditionsCallback();
		super.connectedCallback({
			style: component.template`
				:host { position: fixed; left: 0; bottom: 0; padding: 0 30px 10px 30px; transform: translateX(-50%); display: block; text-align: center; overflow: hidden; }

				img { height: 60px; filter: var(--graphic-s); }
				#container { display: block; transform-origin: 50% 125%; }
				#display { display: inline-block; padding: 6px; border-radius: 3px; background: var(--paper-1); color: var(--pen-1); white-space: nowrap; box-shadow: var(--paper-s); }

				${style ? style() : ""}
			`,

			markup: component.template`
				<div id="container">
					<img src="/assets/raised-hand.svg" /><br />
					<div id="display">${this.display}</div>
				</div>

				${markup ? markup() : ""}
			`
		});

		this.style.left = `${this.position}vw`;
		const containerElement = this.shadowRoot.getElementById("container");

		this.show = anime({
			targets: containerElement,
			duration: 800,
			translateY: ["100px", "0px"],
			rotate: -5,
			easing: "easeInOutElastic",
			loop: false,
			complete: () => {
				this.wave = anime({
					targets: containerElement,
					duration: 1200,
					direction: "alternate",
					rotate: [-5, 5],
					easing: "easeInOutQuad",
					loop: true
				});
			}
		});

		// Redirect events.
		/* None */

		// Handle events.
		/* None */

		this.raise();
	}

	disconnectedCallback () {
		super.disconnectedCallback();
	}

	lower () {
		const containerElement = this.shadowRoot.getElementById("container");

		this.show.pause();
		this.show.remove(containerElement);

		if (this.wave) {
			this.wave.pause();
			this.wave.remove(containerElement);
		}

		const hide = anime({
			targets: containerElement,
			duration: 600,
			translateY: ["+=100px"],
			easing: "easeInOutElastic",
			loop: false,
			complete: () => {
				hide.remove(containerElement);
				this.remove();
			}
		});
	}

	raise () {
		if (this.timers.done !== undefined)
			clearTimeout(this.timers.done);

		this.timers.done = setTimeout(() => this.lower(), 2000);
	}
}

window.customElements.define("app-handup", handup);