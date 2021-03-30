import anime from "/assets/scripts/anime.es.js";
import { component } from "/components/component.js";

export class react extends component {
	constructor (_properties = {}) {
		super({ ..._properties });

		const { position, reaction, display } = _properties;
		this.property({ name: "position", value: position, options: { default: { x: 50, y: 50 }} })
			.property({ name: "reaction", value: reaction, options: { default: "like" } })
			.property({ name: "display", value: display, options: { default: null } });
    }

	connectedCallback ({ style, markup } = {}) {
		super.conditionsCallback();
		super.connectedCallback({
			style: component.template`
				@import url("/styles/shake.css");

				:host { position: fixed; left: ${this.position.x}%; top: ${this.position.y}%; transform: translate(-50%, -50%); display: block; text-align: center; overflow: hidden; padding: 40px; opacity: 0.75; }
		
				i { font-size: 48pt; color: var(--pen-1); filter: var(--graphic-s); margin-bottom: 10px; }
				#container { display: block; }
				#display { display: inline-block; padding: 6px; border-radius: 3px; background: var(--paper-1); color: var(--pen-1); white-space: nowrap; box-shadow: var(--paper-s); }

				${style ? style() : ""}
			`,

			markup: component.template`
				<div id="container" class="shake-little shake-constant">
					<i id="icon" class="fad fa-${this.reaction}" /></i><br />
					<div id="display">${this.display}</div>
				</div>

				${markup ? markup() : ""}
			`
		});

		anime({
			targets: this.shadowRoot.getElementById("container"),
			duration: 2000,
			opacity: [0, 1],
			marginTop: "50%",
			loop: false,
			complete: () => {
				anime({
					targets: this.shadowRoot.getElementById("container"),
					duration: 2000,
					opacity: 0,
					easing: "easeInOutElastic",
					loop: false
				});
		
				anime({
					targets: this.shadowRoot.getElementById("icon"),
					duration: 2000,
					marginTop: "-50%",
					scale: 1.5,
					easing: "easeInOutElastic",
					loop: false,
					complete: () => this.remove()
				});
			}
		});

		// Redirect events.
		/* None */

		// Handle events.
		/* None */
	}

	disconnectedCallback () {
		super.disconnectedCallback();
	}
}

window.customElements.define("app-react", react);