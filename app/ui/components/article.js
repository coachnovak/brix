import { component } from "/components/component.js";
import { button } from "/components/button.js";

export class article extends component {
	constructor (_properties = {}) {
		super({ ..._properties });

		const { name, parameters, type, shadow, position, shelf, show, full, grow, closable } = _properties;
		this.property({ name: "name", value: name, options: { default: null, isattribute: true } })
			.property({ name: "parameters", value: parameters, options: { default: {}, isattribute: false } })
			.property({ name: "type", value: type, options: { default: "content", isattribute: true } })
			.property({ name: "shadow", value: shadow, options: { default: null, isattribute: false } })
			.property({ name: "position", value: position, options: { default: "center", isattribute: true } })
			.property({ name: "shelf", value: shelf, options: { default: false, isattribute: true } })
			.property({ name: "show", value: show, options: { default: false, isattribute: true } })
			.property({ name: "full", value: full, options: { default: false, isattribute: true } })
			.property({ name: "grow", value: grow, options: { default: false, isattribute: true } })
			.property({ name: "closable", value: closable, options: { default: type === "content" ? false : true, isattribute: false } });
    }

	connectedCallback ({ style, markup } = {}) {
		super.conditionsCallback();
		super.connectedCallback({
			style: component.template`
				/* Common */

				:host { --size-xs: 300px; --size-s: 500px; --size-m: 700px; --size-l: 900px; --size-xl: 1100px; }
				#close { position: absolute; top: calc(var(--spacing) / 2); right: calc(var(--spacing) / 2); }
		
				/* Contents */
		
				:host([type="content"]) { display: block; flex: 0 1 auto; width: 100%; transform: translateY(10%); opacity: 0; position: relative; margin-bottom: var(--spacing); }
				:host([type="content"]:last-child) { margin-bottom: 0; }
				:host([type="content"][show="true"]) { animation: content-show forwards; }
				:host([type="content"][full="true"]) { position: absolute; left: 0; top: 0; right: 0; bottom: 0; }
				:host([type="content"][grow="true"]) { flex: 1 1 auto; overflow: auto; }
				:host([type="content"][shelf="true"]) { background-color: var(--paper-2); padding: var(--spacing); box-shadow: var(--paper-s); }
		
				@media (orientation: portrait) {
					:host([type="content"][grow="true"]) { min-height: 300px; }
				}
		
				@media (orientation: landscape) {
					:host([type="content"][full="true"]) { position: relative; left: unset; top: unset; right: unset; bottom: unset; }
				}
				
				@keyframes content-show {
					0% { transform: translateY(10%); opacity: 0; }
					100% { transform: translateY(0%); opacity: 1; }
				}
				
				/* Windows */
		
				:host([type="window"]) { display: block; position: absolute; top: 0; right: 0; bottom: 0; min-width: 100%; max-width: calc(300px); max-height: 100vh; padding: var(--spacing); overflow: auto; }
				:host([type="window"]) { transform: translateX(100%); opacity: 0; background: var(--paper-1); color: var(--pen-1); box-shadow: var(--paper-s); }
				:host([type="window"][show="true"]) { transform: translateX(0%); opacity: 1; transition-property: transform, opacity !important; }
				:host([type="window"][position="side"]) { min-width: calc(100% - var(--spacing)); left: var(--spacing); }
		
				@media all and (orientation: landscape) {
					:host([type="window"]) { padding: calc(var(--spacing) * 2); }
					:host([type="window"][position="side"]) { left: unset; min-width: unset; max-width: unset; width: 300px; }
					:host([type="window"][position="center"]) { left: 50%; top: 50%; right: unset; bottom: unset; min-width: 300px; max-width: 100vw; transform: translate(-50%, -30%); }
					:host([type="window"][position="center"][show="true"]) { transform: translate(-50%, -50%); }
				}
				
				@keyframes windows-slidein {
					0% { transform: translateY(10%); opacity: 0; }
					100% { transform: translateY(0%); opacity: 1; }
				}

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

		import(`/articles/${this.name}.js`).then(_imported => {
			// Article has been downloaded.
			this.instance = _imported.default;

			if (this.instance.options)
				Object.assign(this, this.instance.options);

			const templateElement = document.createElement("template");
			templateElement.innerHTML = `
				<!-- Article style -->
				<style>${this.instance.templates().style()}</style>
	
				<!-- Article markup -->
				${this.instance.templates().markup()}
	
				<!-- Standard close button -->
				${this.closable ? `<app-button id="close" icon="times" composition="icon" embedded="true" tiptext="Close" tipplacement="bottom"></app-button>` : ``}
			`;
	
			this.append(templateElement.content.cloneNode(true));
			this.instance.script(this).then(() => {
				// Script has been ran.
				const closeElement = this.find("#close");
				if (this.closable && closeElement.events)
					closeElement.events.on("activated", () => this.close("closed"));
		
				if (this.show === "false")
					this.timers.once(20, () => this.show = true);
			});
		});
	}

	disconnectedCallback () {
		super.disconnectedCallback();
	}

	async close (_action = "closed", _data = {}) {
		this.events.emit(_action, _data);
		if (this.shadow) this.shadow.remove();
		this.remove();
	}
}

globalThis.customElements.define("app-article", article);