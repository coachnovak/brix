import { base } from "/components/base.js";

export class wheel extends base {
	constructor (_properties = {}) {
		super(Object.assign(_properties ? _properties : {}, {

        }));

		this
			.property("items", _properties.items ? _properties.items : []);

		this.styles.push(`
			:host { background: red; width: 100%; height: 80px; }

			#items { --color: rgb(0, 0, 0); --x: 0px; --y: 0px; }
			#items { position: absolute; left: 50%; top: top%; width: 500px; height: 500px; transform: translate(-50%, -50%); }

			.arc { position: absolute; top: 0; right: 0; width: 50%; height: 50%; transform-origin: 0% 100%; transform: scale(0) rotate(var(--rotation)); clip-path: polygon(0 0, 0 99%, 99% 0); }
			.arc { transition-property: transform, opacity; transition-duration: 0.2s; transition-timing-function: cubic-bezier(0.4, -0.4, 0.7, -0.3); }
			.arc { background-image: radial-gradient(circle at 0% 100%, transparent, transparent 30%, var(--color) 30.25%, var(--color) 50%, transparent 50.25%, transparent); opacity: 0; }
			.arc i { position: absolute; left: 17%; top: 42%; font-size: 24px; transform: rotate(calc(var(--rotation) * -1)); color: rgba(255, 255, 255, 1); }
			
			#items.on .arc { opacity: 1; transform: scale(1) rotate(var(--rotation)) !important; transition-timing-function: cubic-bezier(0, 0.5, 0.5, 1.5); }
		`);
	}

	async connectedCallback () {
		await super.connectedCallback();
		this.readInIcons();

		const itemstylesElement = this.appendChild(document.createElement("style"));
		itemstylesElement.setAttribute("id", "itemstyles");

		const itemsElement = this.appendChild(document.createElement("div"));
		itemsElement.setAttribute("id", "items");

		let showing, anchorX, anchorY, min = 100;
		
		const mouseDown = ({ clientX: x, clientY: y }) => {
			showing = true;
			anchorX = x;
			anchorY = y;
		
			itemsElement.style.setProperty("--x", `${x}px`);
			itemsElement.style.setProperty("--y", `${y}px`);
			itemsElement.classList.add("on");
		}
		
		const mouseUp = () => {
			const selection = itemsElement.getAttribute("data-chosen");
			console.log(selection);
		
			showing = false;
			itemsElement.setAttribute("data-chosen", 0);
			itemsElement.classList.remove("on");
		}
		
		const mouseMove = ({ clientX: x, clientY: y }) => {
			if (!showing) return;
		
			let dx = x - anchorX, dy = y - anchorY;
			let mag = Math.sqrt(dx * dx + dy * dy);
			let index = 0;
		
			if (mag >= min) {
				let deg = Math.atan2(dy, dx) + 0.625 * Math.PI;
				while (deg < 0) deg += Math.PI * 2;
				index = Math.floor(deg / Math.PI * 4) + 1;
			}
		
			itemsElement.setAttribute("data-chosen", index);
		}

		this.on("contextmenu", _event => _event.preventDefault() & _event.stopPropagation());
		this.on("mousedown", mouseDown);
		this.on("touchstart", _event => mouseDown(_event.touches[0]));
		this.on("mouseup", mouseUp);
		this.on("touchend", _event => mouseUp(_event.touches[0]));
		this.on("mousemove", mouseMove);
		this.on("touchmove", _event => mouseMove(_event.touches[0]));

		await this.render();
		this.emit("ready");
	}

	async render () {
		const itemsElement = this.use("items");
		itemsElement.innerHTML = "";

		const itemstylesElement = this.use("itemstyles");
		itemstylesElement.innerHTML = "";

		const round = (_number, _decimalPlaces) => {
			const factorOfTen = Math.pow(10, _decimalPlaces)
			return Math.round(_number * factorOfTen) / factorOfTen
		};

		const degreesPerItem = round(360 / this.items.length, 2);
		const offsetDegrees = round(degreesPerItem / 2, 2);

		this.items.forEach((_item, _index) => {
			itemstylesElement.innerHTML = `
				${itemstylesElement.innerHTML}

				#items[data-chosen="${_index + 1}"] .arc:nth-child(${_index + 1}) { transform: scale(1.1) rotate(var(--rotation)) !important; }
				#items .arc:nth-child(${_index + 1}) { --rotation: ${(degreesPerItem * _index) - offsetDegrees}deg; }
			`;

			const itemElement = itemsElement.appendChild(document.createElement("div"));
			itemElement.setAttribute("id", _item.id);
			itemElement.classList.add("arc");

			const iconElement = itemElement.appendChild(document.createElement("i"));
			iconElement.classList.add("fad");
			iconElement.classList.add(`fa-${_item.icon}`);
		});
	}
}

globalThis.customElements.define("app-wheel", wheel);