import events from "/components/events.js";
import timers from "/components/timers.js";

export class component extends HTMLElement {
	properties = []

	static template (_strings, ..._placeholders) {
		return () => String.raw(_strings, ..._placeholders);
	}

	constructor (_properties = {}) {
		super();

		// Read default content.
		this.initial = this.innerHTML;

		// Prepare conditions.
		this.timers = new timers();
		this.events = new events();

		const { id, visible, canfocus } = _properties;
		this.property({ name: "id", value: id, options: { default: null, isattribute: true } })
			.property({ name: "visible", value: visible, options: { default: true, isattribute: true } })
			.property({ name: "canfocus", value: canfocus, options: { default: false }, getter: () => this.getAttribute("tabindex") === "0" });
    }

	conditionsCallback () {
		if (this.conditioned) return;
		else this.conditioned = true;

		// Handle events.
		this.events.on("canfocus updated", _value => {
			if (_value) this.setAttribute("tabindex", "0");
			else this.removeAttribute("tabindex");
		});

		// Define properties.
		this.properties.forEach(({ name, value, options = {}, getter, setter }) => {
			// Read in value from attribute if available.
			if (options.isattribute === true && this.getAttribute(name))
				value = this.getAttribute(name);

			// Set default value ifno initial value was provided.
			if (value === undefined && options.default !== undefined)
				value = options.default;

			Object.defineProperty(this, name, {
				get: () => {
					if (getter)
						return getter();
					else if (options.isattribute === true)
						return this.getAttribute(name);
					else
						return this[`_${name}`];
				},

				set: (_value) => {
					if (setter)
						setter(_value);
					else if (options.isattribute === true && _value === null)
						this.removeAttribute(name);
					else if (options.isattribute === true)
						this.setAttribute(name, _value);
					else
						this[`_${name}`] = _value;

					this.events.emit(`${name} updated`, _value);
				}
			});

			// Set initial value.
			this[name] = value;
		});
	}

    connectedCallback ({ style, markup } = {}) {
		this.conditionsCallback();

		const base = {
			style: component.template`
				@import url("index.css");

				:host { display: block; }
				:host([visible="false"]) { display: none; }

				${style ? style() : ""}
			`,

			markup: component.template`
				${markup ? markup() : ""}
			`
		};

		// Create content.
		const templateElement = document.createElement("template");
		templateElement.innerHTML = `<style>${base.style()}</style>${base.markup()}`;

		// Create shadow dom.
		this.attachShadow({ mode: "open" });
		this.shadowRoot.appendChild(templateElement.content.cloneNode(true));

		// Pull fontawesome.
		const pullFontawesome = () => {
			const fontawesomeElement = document.getElementById("fa-main");
			if (!fontawesomeElement) return setTimeout(() => pullFontawesome(), 5);
			this.append(fontawesomeElement.cloneNode(true));
		};

		pullFontawesome();
		this.events.emit("ready");
	}

    disconnectedCallback () {
        this.events.emit("disposed");

		this.timers.clear();
		this.events.clear();
	}

	property (_property) {
		this.properties.push(_property);
		return this;
	}

	focus () {
		this.focus();
	}

	blur () {
		this.blur();
	}

	find (_query) {
		const recurseDown = _element => {
			const elementRoot = _element.shadowRoot || _element;
			let elementFound = elementRoot.querySelector(_query);
			if (elementFound) return elementFound;

			for (let childIndex = 0; childIndex < elementRoot.children.length; childIndex++) {
				elementFound = recurseDown(elementRoot.children[childIndex]);
				if (elementFound) return elementFound;
			}
		}

        return recurseDown(this);
	}

	children () {
		return this.shadowRoot ? this.shadowRoot.children : super.children;
	}

	append (_element) {
		return this.shadowRoot ? this.shadowRoot.appendChild(_element) : super.appendChild(_element);
	}

	replace (_element) {
		this.replaceWidth(_element);
	}

	remove () {
		const parentElement = this.parentElement || this.parentNode;
		if (parentElement) parentElement.removeChild(this);
	}

	html (_value) {
		if (this.shadowRoot) this.shadowRoot.innerHTML = _value;
		else this.innerHTML = _value;
	}

	clear () {
		if (this.shadowRoot) this.shadowRoot.innerHTML = "";
		else this.innerHTML = "";
	}
}

globalThis.customElements.define("app-component", component);