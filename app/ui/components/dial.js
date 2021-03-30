import anime from "/assets/scripts/anime.es.js";
import events from "/components/events.js";

export class dial extends HTMLElement {
	template = {
		style: `
			<style>
				:host { transition-timing-function: cubic-bezier(1, .96, .01, 1); transition-duration: 0.15s; transition-property: transform, opacity; }
				:host { position: absolute; transform: scale(0); }
				:host(.show) { transform: scale(1); opacity: 1; }

				:host i { position: absolute; color: rgba(var(--action-e-f), 1); }
				:host(.some) i { font-size: 24px; }
				:host(.many) i { font-size: 18px; }
				:host(.alot) i { font-size: 14px; }

				:host svg path { fill: rgba(var(--action-e-1), 1); transition-property: opacity; transition-duration: 0.15s; }
				:host svg path.selected { fill: rgba(var(--action-e-2), 1); }
			</style>
		`,

		markup: `

		`
	}

	constructor(_properties = {}) {
		super();

		// Setup event management.
		this.events = new events();

		// Define properties.
		Object.defineProperty(this, "trigger", { value: _properties.trigger ? _properties.trigger : "document", writable: true });
		Object.defineProperty(this, "items", { value: [], writable: true });
		Object.defineProperty(this, "size", { value: 320, writable: true });
		Object.defineProperty(this, "radius", { value:  _properties.radius ? _properties.radius : 70, writable: true });
		Object.defineProperty(this, "spread", { value: 70, writable: true });
		Object.defineProperty(this, "expand", { value: 5, writable: true });
		Object.defineProperty(this, "gap", { value: 1.5, writable: true });
		Object.defineProperty(this, "selected", { value: -1, writable: true });
		Object.defineProperty(this, "offset", { value: _properties.offset ? _properties.offset : 0, writable: true });
		Object.defineProperty(this, "limit", { value: _properties.limit ? _properties.limit : 359.999, writable: true });
		Object.defineProperty(this, "center", { get() { return this.size / 2; } });

		const construct = () => {
			const fontawesomeElement = document.getElementById("fa-main");
			if (!fontawesomeElement) return setTimeout(() => construct(), 5);

			const templateElement = document.createElement("template");
			templateElement.innerHTML = `
				<style media="all" id="fa-main">
					${fontawesomeElement.innerHTML}
				</style>
	
				${this.template.style}
				${this.template.markup}
			`;
	
			this.attachShadow({ mode: "open" });
			this.shadowRoot.appendChild(templateElement.content.cloneNode(true));

			let width = this.size, height = this.size;
			if (this.offset >= 180 && (this.offset + this.limit) < 360) width = this.size / 2;
			if (this.offset >= 90 && (this.offset + this.limit) < 270) height = this.size / 2;

			this.style.width = `${width}px`;
			this.style.height = `${height}px`;

			const graphicsElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			graphicsElement.setAttribute("id", "graphics");
			graphicsElement.setAttribute("width", width);
			graphicsElement.setAttribute("height", height);
			this.shadowRoot.appendChild(graphicsElement);
		};

		construct();
	}

	connectedCallback () {
		let sX, sY;

		this.events.on("trigger", _event => {
			sX = _event.clientX; sY = _event.clientY;
			this.style.left = `${sX - this.size / 2}px`;
			this.style.top = `${sY - this.size / 2}px`;
			this.classList.add("show");
		});

		this.events.on("mouseup", () => {
			if (!this.classList.contains("show"))
				return;

			if (this.selected > -1 && this.selected < this.items.length)
				this.events.emit("selected", this.items[this.selected].id);

			this.classList.remove("show");
			this.deselect();

			this.events.emit("mouseup");
		});

		this.events.on("mousemove", ({ clientX, clientY }) => {
			if (!this.classList.contains("show")) return;

			let dX = clientX - sX, dY = -(clientY - sY);
			let mag = Math.sqrt(dX * dX + dY * dY);
			if (mag < this.radius) return this.deselect();

			const width = this.limit / this.items.length;
			let deg = this.offset + ((Math.atan2(dX, dY) * 180) / Math.PI);
			if (deg < 0) deg += 360;
			if (deg > this.limit) return this.deselect();

			const index = Math.floor(deg / width);
			if (index > -1 && index < this.items.length && this.selected !== index) this.deselect(index);
			this.selected = index;

			const graphicsElement = this.shadowRoot.getElementById("graphics");
			const itemElement = graphicsElement.children.item(this.selected);
			if (itemElement && !itemElement.classList.contains("selected")) {
				itemElement.classList.add("selected");
				this.events.emit("hovering", this.items[this.selected].id);

				if (this.items.length < 2) return;
				itemElement.animateArc.play();
				itemElement.animateIcon.play();
			}
		});

		if (this.trigger === "document")
			document.addEventListener("mousedown", _event => this.events.emit("trigger", _event));

		if (this.trigger === "document")
			document.addEventListener("touchstart", _event => this.events.emit("trigger", _event.touches[0]));

		document.addEventListener("contextmenu", _event => _event.preventDefault() & _event.stopPropagation());
		document.addEventListener("mouseup", _event => this.events.emit("mouseup", _event));
		document.addEventListener("touchend", _event => this.events.emit("mouseup", _event.touches[0]));
		document.addEventListener("mousemove", _event => this.events.emit("mousemove", _event));
		document.addEventListener("touchmove", _event => this.events.emit("mousemove", _event.touches[0]));
	}

	clear () {
		const iconElements = this.shadowRoot.querySelectorAll("i");
		iconElements.forEach(_element => _element.remove());

		const graphicsElement = this.shadowRoot.getElementById("graphics");
		graphicsElement.innerHTML = "";		

		this.items = [];
		return this;
	}

	add (_items) {
		if (_items instanceof Array)
			_items.forEach(_item => this.items.push(_item));
		else
			this.items.push(_items);

		this.classList.remove("some", "many", "alot");
		if (this.items.length < 10) this.classList.add("some");
		else if (this.items.length > 9 && this.items.length < 17) this.classList.add("many");
		else if (this.items.length > 16) this.classList.add("alot");

		this.render();
		return this;
	}

	render() {
		const width = this.limit / this.items.length;
		const gapshrink = this.spread / this.radius;
		const gapgrow = 1 + this.spread / this.radius;
		const graphicsElement = this.shadowRoot.getElementById("graphics");

		const polarToCartesian = (_radius, _degrees) => {
			const radians = ((_degrees - 90) * Math.PI) / 180.0;
			return { x: this.center + _radius * Math.cos(radians), y: this.center + _radius * Math.sin(radians) };
		};

		const create = (_item, _index) => {
			_item.degrees = this.offset + Math.round(width * _index + -90);

			// Create path element.
			const start = this.offset + (_index * width);
			const end = start + width;

			const normal = {
				inner: { a: polarToCartesian(this.radius, end - this.gap * gapgrow), b: polarToCartesian(this.radius, start) },
				outer: { a: polarToCartesian(this.radius + this.spread, end - this.gap * gapshrink), b: polarToCartesian(this.radius + this.spread, start) },
				flag: end - start <= 180 ? "0" : "1"
			};

			const selected = {
				inner: { a: polarToCartesian(this.radius + this.expand, end - this.gap * gapgrow), b: polarToCartesian(this.radius + this.expand, start) },
				outer: { a: polarToCartesian(this.radius + this.expand + this.spread, end - this.gap * gapshrink), b: polarToCartesian(this.radius + this.expand + this.spread, start) },
				flag: end - start <= 180 ? "0" : "1"
			};

			const normalPoints = ["M", normal.outer.a.x, normal.outer.a.y, "A", this.radius + this.spread, this.radius + this.spread, 0, normal.flag, 0, normal.outer.b.x, normal.outer.b.y, "L", normal.inner.b.x, normal.inner.b.y, "A", this.radius, this.radius, 0, normal.flag, 1, normal.inner.a.x, normal.inner.a.y, "L", normal.outer.a.x, normal.outer.a.y, "Z"].join(" ");
			const selectedPoints = ["M", selected.outer.a.x, selected.outer.a.y, "A", this.radius + this.spread, this.radius + this.spread, 0, selected.flag, 0, selected.outer.b.x, selected.outer.b.y, "L", selected.inner.b.x, selected.inner.b.y, "A", this.radius, this.radius, 0, selected.flag, 1, selected.inner.a.x, selected.inner.a.y, "L", selected.outer.a.x, selected.outer.a.y, "Z"].join(" ");

			const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
			pathElement.setAttribute("d", normalPoints);
			graphicsElement.appendChild(pathElement);

			pathElement.animateArc = anime.timeline({ duration: 200, autoplay: false, elasticity: 150, loop: false });
			pathElement.animateArc.add({ targets: pathElement, d: [{ value: normalPoints }, { value: selectedPoints }] });

			// Create icon element.
			const iconElement = this.shadowRoot.appendChild(document.createElement("i"));
			iconElement.classList.add("fad", `fa-${_item.icon}`);

			const normalRadius = this.radius + (this.spread / 2); // Distance from center
			const selectedRadius = this.radius + (this.spread / 2) + this.expand; // Distance from center
			const centerX = this.center, centerY = this.center; // Center of measure
			const calculatePosition = (_radius, _position, _length, _function) => ((_position + (_radius * Math[_function]((_item.degrees + (width / 2)) * (Math.PI / 180)))) - _length);

			let normalPositionX = calculatePosition(normalRadius, centerX, iconElement.clientWidth / 2, "cos");
			let normalPositionY = calculatePosition(normalRadius, centerY, iconElement.clientHeight / 2, "sin");

			let selectedX = calculatePosition(selectedRadius, centerX, iconElement.clientWidth / 2, "cos");
			let selectedY = calculatePosition(selectedRadius, centerY, iconElement.clientHeight / 2, "sin");

			iconElement.style.left = `${normalPositionX}px`;
			iconElement.style.top = `${normalPositionY}px`;

			pathElement.animateIcon = anime.timeline({ duration: 200, autoplay: false, elasticity: 150, loop: false });
			pathElement.animateIcon.add({ targets: iconElement, left: [{ value: `${normalPositionX}px` }, { value: `${selectedX}px` }], top: [{ value: `${normalPositionY}px` }, { value: `${selectedY}px` }] });
		};

		graphicsElement.innerHTML = "";
		this.shadowRoot.querySelectorAll("i").forEach(_element => _element.remove());

		for (let itemIndex = 0; itemIndex < this.items.length; itemIndex++)
			create(this.items[itemIndex], itemIndex);
	}

	deselect(_new = -1) {
		if (this.selected !== _new) {
			const previousElement = this.shadowRoot
				.getElementById("graphics")
				.children
				.item(this.selected);

			this.selected = -1;
			this.events.emit("deselected");

			if (previousElement) {
				previousElement.classList.remove("selected");

				if (this.items.length < 2) return;
				previousElement.animateArc.pause();
				previousElement.animateArc.seek(0);

				previousElement.animateIcon.pause();
				previousElement.animateIcon.seek(0);
			}
		}
	}
}

window.customElements.define("app-dial", dial);