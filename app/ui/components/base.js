export class base extends HTMLElement {
	properties = [];

	constructor (_properties = {}) {
		super();

		this
			.property("id", _properties.id !== undefined ? _properties.id : null)
			.property("visible", _properties.visible !== undefined ? _properties.visible : true)
			.property("isolated", _properties.isolated !== undefined ? _properties.isolated : true, { attribute: false })
            .property("styles", _properties.styles !== undefined ? _properties.styles : [], { attribute: false })
			.property("disposing", _properties.disposing !== undefined ? _properties.disposing : false, { attribute: false });

		if (this.isolated) {
			this.root = this.attachShadow({ mode: "open", delegatesFocus: _properties.delegatesFocus ? _properties.delegatesFocus : false });
			this.root.innerHTML = this.innerHTML;
            this.innerHTML = "";
		}

        this.styles.push(`
			@import url("index.css");

			:host { display: block; }
            :host([visible="false"]) { display: none; }
        `);
    }

    async connectedCallback () {
        this.properties.forEach(_property => {
			if (_property.options)
				if (_property.options.attribute === undefined || _property.options.attribute === true)
					this.attribute(_property.name, this[`_${_property.name}`])
        });

        if (this.isolated) {
			let styles = "";
			this.styles.forEach(_style => styles += _style);
			this.html(`
				<style>${styles}</style>
				${this.html()}
			`);
        }
	}

    async disconnectedCallback () {
		this.disposing = true;
        this.emit("disposing");
	}

	clear () {
		debugger
		if (this.isolated)
			return this.root.innerHTML = "";
		else
			return this.innerHTML = "";
	}

	html (_content) {
		if (_content) {
			if (this.isolated)
				this.root.innerHTML = _content;
			else
				this.innerHTML = _content;
		} else {
			if (this.isolated)
				return this.root.innerHTML;
			else
				return this.innerHTML;
		}
	}

	append (_html) {
		if (this.isolated)
			return this.root.innerHTML += _html;
		else
			return super.innerHTML += _html;
	}

	appendChild (_element) {
		if (this.isolated)
			return this.root.appendChild(_element);
		else
			return super.appendChild(_element);
	}

	children () {
		if (this.isolated)
			return this.root.children;
		else
			return super.children;
	}

	use (_query, _options) {
        const recurseUp = _element => {
            if (!_element) return;
            if (_element.tagName && _element.tagName.toLowerCase() === _query) return _element;
            return recurseUp(_element.parentElement || _element.getRootNode().host);
        }

		const recurseDown = _element => {
			const searchIn = _element.root ? _element.root : _element;
			let foundElement = null;

			if (_options && _options.query && searchIn.querySelector) {
				return searchIn.querySelector(_query);
			} else if (_options && _options.queryAll && searchIn.querySelectorAll) {
				return searchIn.querySelectorAll(_query);
			} else if (searchIn.getElementById) {
				foundElement = searchIn.getElementById(_query);
				if (foundElement) return foundElement;
			} else if (searchIn.querySelector) {
				foundElement = searchIn.querySelector(`[id="${_query}"]`);
				if (foundElement) return foundElement;
			}

			for (let childIndex = 0; childIndex < searchIn.children.length; childIndex++) {
				foundElement = recurseDown(searchIn.children[childIndex]);
				if (foundElement) return foundElement;
			}
		}

        if (_options && _options.upward) return recurseUp(this);
        else return recurseDown(this);
	}

    on (_name, _function, _options = {}) {
        this.addEventListener(_name, _function, {
			once: _options.once ? _options.once : false,
			composed: _options.composed ? _options.composed : false
		});

        return {
			dispose: () => this.removeEventListener(_name, _function)
		};
    }

    once (_name, _function, _options) {
        return this.on(_name, _function, Object.assign(_options ? _options : {}, {
			once: true
		}));
    }

	emit (_name, _options = {}) {
        this.dispatchEvent(new CustomEvent(_name, { detail: _options.data }));
        return this;
    }

	property (_name, _default, _options = {}) {
        let defaultValue = _default !== undefined || _default !== null ? _default : null;

        if (defaultValue === null && this.hasAttribute(_name)) {
			const attributeValue = this.getAttribute(_name);

			// Convert attribute value to proper primitive type.
			if (attributeValue === "true" || attributeValue === "false")
				defaultValue = this.getAttribute(_name) === "true";
			else
				defaultValue = this.getAttribute(_name);
		}

		this.properties.push({
			name: _name,
			default: defaultValue,
			options: _options
		});

		Object.defineProperty(this, _name, {
			get () {
				if (_options && _options.getter && typeof _options.getter === "function") {
					return _options.getter(this[`_${_name}`]);
				} else {
					return this[`_${_name}`];
				}
			},
			set (_value) {
                let newValue;

				if (_options && _options.setter && typeof _options.setter === "function")
					newValue = _options.setter(_value);
				else
					newValue = _value;

                const previousValue = this[`_${_name}`];
                this[`_${_name}`] = newValue;

				if (_options.attribute === undefined || _options.attribute === true)
					this.attribute(_name, _value);

                let emitChange = true;
                let valueChanged = previousValue !== newValue;

                if (valueChanged !== true && _options.emitWhenEqual === false) emitChange = false;
                if (emitChange === true) this.emit(`${_name} updated`, { data: _value });
			}
		});

		if (_options && _options.setter && typeof _options.setter === "function")
			defaultValue = _options.setter(defaultValue);

		this[`_${_name}`] = defaultValue;

		if (_options.attribute === undefined || _options.attribute === true)
			this.attribute(_name, defaultValue);

		return this;
	}

	async attribute (_name, _value) {
		if (!_name) throw { name: "MissingArgument", description: "The argument '_name' is expected but not provided." };
		if (typeof _name !== "string") throw { name: "InvalidArgumentType", description: "The argument type of '_name' must be string." };

		if (!this.isConnected)
			return;

		if (_value !== null)
			if (typeof _value === "boolean")
				this.setAttribute(_name, _value.toString().toLowerCase());
			else if (typeof _value === "number")
				this.setAttribute(_name, _value.toString());
			else if (typeof _value === "string")
				this.setAttribute(_name, _value);
			else
				this.removeAttribute(_name);
		else
			this.removeAttribute(_name);

		this.emit(`${_name} attribute updated`);
		return this;
	}

	async tabable () {
		this.attribute("tabindex", "0");
    }

    async show () {
        if (this.visible !== true)
            this.visible = true;
    }

    async hide () {
        if (this.visible !== false)
            this.visible = false;
	}
	
	async remove () {
		const parent = (this.parentElement ? this.parentElement : this.parentNode);
		if (parent) parent.removeChild(this);
	}

	readInIcons () {
		const style = document.getElementById("fa-main");

		if (style) {
			this.append(`
				<style media="all" id="fa-main">${style.innerHTML}</style>
			`);
		} else {
			setTimeout(() => { this.readInIcons(); }, 10);
		}
	}
}

globalThis.customElements.define("app-base", base);