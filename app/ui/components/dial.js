import events from "/components/events.js";

export class dial extends HTMLElement {
	template = {
		style: `
			<style>
				:host { transition-timing-function: cubic-bezier(0.4, -0.4, 0.7, -0.3); transition-duration: 0.15s; transition-property: transform, opacity; }
				:host { position: absolute; transform: scale(0); }
				:host(.show) { transform: scale(1); opacity: 1; }
				:host i { position: absolute; font-size: 24px; color: rgba(255, 255, 255, 1); }
				:host svg path { opacity: 0.1; fill: rgba(200, 200, 200, 1); transition-property: opacity; transition-duration: 0.15s; }
				:host svg path.selected { opacity: 0.4; }
			</style>
		`,

		markup: `

		`
	}

	constructor() {
		super();

		// Setup event management.
		this.events = new events();

		// Define properties.
		Object.defineProperty(this, "size", { value: 320, writable: true });
		Object.defineProperty(this, "radius", { value: 70, writable: true });
		Object.defineProperty(this, "spread", { value: 70, writable: true });
		Object.defineProperty(this, "expand", { value: 5, writable: true });
		Object.defineProperty(this, "gap", { value: 1.5, writable: true });
		Object.defineProperty(this, "selected", { value: -1, writable: true });
		Object.defineProperty(this, "center", { get() { return this.size / 2; } });

		performance.mark("icons");
		const fontawesomeElement = document.getElementById("fa-main");
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
		performance.measure("loading icons", "icons");
		console.log(performance.getEntriesByType("measure")[0].duration);

		this.style.width = `${this.size}px`;
		this.style.height = `${this.size}px`;

		const graphicsElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		graphicsElement.setAttribute("id", "graphics");
		graphicsElement.setAttribute("width", this.size);
		graphicsElement.setAttribute("height", this.size);
		this.shadowRoot.appendChild(graphicsElement);

		this.items = [
			{ id: "test-1", icon: "female" },
			{ id: "test-2", icon: "car" },
			{ id: "test-3", icon: "car" },
			{ id: "test-4", icon: "theater-masks" },
			{ id: "test-5", icon: "car" },
			{ id: "test-6", icon: "car" },
			{ id: "test-7", icon: "theater-masks" },
			{ id: "test-8", icon: "female" },
			{ id: "test-9", icon: "car" },
			{ id: "test-10", icon: "car" },
			{ id: "test-11", icon: "car" },
			{ id: "test-12", icon: "car" }
		];

		this.render();

		let sX, sY;
		const mousedown = ({ clientX, clientY }) => {
			sX = clientX; sY = clientY;
			this.style.left = `${sX - this.size / 2}px`;
			this.style.top = `${sY - this.size / 2}px`;
			this.classList.add("show");
		}

		const mouseup = () => {
			if (this.selected > -1 && this.selected < this.items.length)
				this.events.emit("selected", this.selected);

			this.classList.remove("show");
			this.deselect();
		}

		const mousemove = ({ clientX, clientY }) => {
			if (!this.classList.contains("show")) return;

			let dX = clientX - sX, dY = -(clientY - sY);
			let mag = Math.sqrt(dX * dX + dY * dY);
			if (mag < this.radius) return this.deselect();

			const width = 359.999 / this.items.length;
			let deg = (Math.atan2(dX, dY) * 180) / Math.PI + width / 2;
			if (deg < 0) deg += 360;

			const index = Math.floor(deg / width);
			if (index > -1 && index < this.items.length && this.selected !== index) this.deselect(index);
			this.selected = index;

			const itemElement = graphicsElement.children.item(this.selected);
			if (itemElement && !itemElement.classList.contains("selected")) {
				itemElement.classList.add("selected");

				if (this.items.length < 2) return;
				itemElement.animateArc.play();
				itemElement.animateIcon.play();
			}
		}

		document.addEventListener("contextmenu", _event => _event.preventDefault() & _event.stopPropagation());
		document.addEventListener("mousedown", _event => mousedown(_event));
		document.addEventListener("touchstart", _event => mousedown(_event.touches[0]));
		document.addEventListener("mouseup", _event => mouseup(_event));
		document.addEventListener("touchend", _event => mouseup(_event.touches[0]));
		document.addEventListener("mousemove", _event => mousemove(_event));
		document.addEventListener("touchmove", _event => mousemove(_event.touches[0]));
	}

	polarToCartesian(_radius, _degrees) {
		const radians = ((_degrees - 90) * Math.PI) / 180.0;
		return { x: this.center + _radius * Math.cos(radians), y: this.center + _radius * Math.sin(radians) };
	}

	render() {
		const width = 359.999 / this.items.length;
		const gapshrink = this.spread / this.radius;
		const gapgrow = 1 + this.spread / this.radius;
		const graphicsElement = this.shadowRoot.getElementById("graphics");

		const create = (_item, _index) => {
			_item.degrees = Math.round(width * _index + -90);

			// Create path element.
			const start = _index * width - width / 2;
			const end = start + width;

			const normal = {
				inner: { a: this.polarToCartesian(this.radius, end - this.gap * gapgrow), b: this.polarToCartesian(this.radius, start) },
				outer: { a: this.polarToCartesian(this.radius + this.spread, end - this.gap * gapshrink), b: this.polarToCartesian(this.radius + this.spread, start) },
				flag: end - start <= 180 ? "0" : "1"
			};

			const selected = {
				inner: { a: this.polarToCartesian(this.radius + this.expand, end - this.gap * gapgrow), b: this.polarToCartesian(this.radius + this.expand, start) },
				outer: { a: this.polarToCartesian(this.radius + this.expand + this.spread, end - this.gap * gapshrink), b: this.polarToCartesian(this.radius + this.expand + this.spread, start) },
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
			const offsetAngle = 0; // Angle offset
			const calculatePosition = (_radius, _position, _length, _function) => ((_position + (_radius * Math[_function]((_item.degrees + offsetAngle) * (Math.PI / 180)))) - _length);

			let normalPositionX = calculatePosition(normalRadius, centerX, iconElement.clientWidth / 2, "cos");
			let normalPositionY = calculatePosition(normalRadius, centerY, iconElement.clientHeight / 2, "sin");

			let selectedX = calculatePosition(selectedRadius, centerX, iconElement.clientWidth / 2, "cos");
			let selectedY = calculatePosition(selectedRadius, centerY, iconElement.clientHeight / 2, "sin");

			iconElement.style.left = `${normalPositionX}px`;
			iconElement.style.top = `${normalPositionY}px`;

			pathElement.animateIcon = anime.timeline({ duration: 200, autoplay: false, elasticity: 150, loop: false });
			pathElement.animateIcon.add({ targets: iconElement, left: [{ value: `${normalPositionX}px` }, { value: `${selectedX}px` }], top: [{ value: `${normalPositionY}px` }, { value: `${selectedY}px` }] });
		};

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