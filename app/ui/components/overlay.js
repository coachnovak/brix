import { component } from "/components/component.js";

export class overlay extends component {
	constructor (_properties = {}) {
		super({ ..._properties });

		const { target } = _properties;
		this.property({ name: "target", value: target, options: { default: null } });
    }

	connectedCallback ({ style, markup } = {}) {
		super.connectedCallback({
			style: component.template`
				:host { position: fixed; left: 0; top: 0; right: 0; bottom: 0; }
				svg { position: fixed; left: 0; top: 0; }
				svg path { fill: hsla(0, 0%, 0%, 0.5); }

				${style ? style() : ""}
			`,

			markup: component.template`
				${markup ? markup() : ""}
			`
		});

		// Build overlay elements.
		const overlayElement = this.append(document.createElementNS("http://www.w3.org/2000/svg", "svg"));
		const pathElement = overlayElement.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "path"));

		const render = () => {
			const bounds = this.target.getBoundingClientRect();
			const padding = 0;

			overlayElement.setAttribute("width", window.innerWidth + "px");
			overlayElement.setAttribute("height", window.innerHeight + "px");

			pathElement.setAttribute("d", `M 0 0 L 0 ${bounds.top - padding} L ${bounds.right + padding} ${bounds.top - padding} L ${bounds.right + padding} ${bounds.bottom + padding} L ${bounds.left - padding} ${bounds.bottom + padding} L ${bounds.left - padding} ${bounds.top - padding} L 0 ${bounds.top - padding} L 0 ${window.innerHeight} L ${window.innerWidth} ${window.innerHeight} L ${window.innerWidth} 0 L 0 0 Z`);
		}

		// Schedule rendering.
		this.timers.repeat(100, () => render());

		// Redirect events.
		this.events.redirect(window, "resize");

		// Handle events.
		this.events.on("resize", () => render());
	}

	disconnectedCallback () {
		super.disconnectedCallback();
	}
}

globalThis.customElements.define("app-overlay", overlay);