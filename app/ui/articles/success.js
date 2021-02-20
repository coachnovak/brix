import { button } from "/components/button.js";

export default {
	options: {
		full: true
	},

	styles: `
		.success.container { height: 260px; }
		.success.container canvas { position: absolute; width: 100%; height: 100%; }
		.success.container .fade { position: absolute; left: -5px; top: -5px; right: -5px; bottom: -5px; background: linear-gradient(180deg, rgba(15,15,25,0) 0%, rgba(15,15,25,1) 100%); }

		.success.container .front { position: absolute; left: 50%; top: 50%; max-width: 100%; overflow: hidden; transform: translate(-50%, -50%); text-align: center; }
		.success.container .front .title { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 10px; }
		.success.container .front .description { max-width: 100%; }
		.success.container .front .actions { display: inline-block; padding-top: 40px; }
		.success.container .front .actions:empty { padding-top: 0; }
	`,

	markup: `
		<div class="success container">
			<canvas id="success.canvas"></canvas>

			<div class="fade">&nbsp;</div>

			<div class="front">
				<h2 id="success.title" class="title center">Success!</h2>
				<div id="success.description" class="description center"></div>
				<div id="success.actions" class="actions"></div>
			</div>
		</div>
	`,

	script: async _component => {
		const titleElement = _component.use("success.title");
		const descriptionElement = _component.use("success.description");
		const actionsElement = _component.use("success.actions");

		if (_component.parameters && _component.parameters.title)
			titleElement.innerHTML = _component.parameters.title;

		if (_component.parameters && _component.parameters.description)
			descriptionElement.innerHTML = _component.parameters.description;

		if (_component.parameters && _component.parameters.action) {
			const actionElement = actionsElement.appendChild(new button(_component.parameters.action.options ? _component.parameters.action.options : {}));
			actionElement.on("activated", () => {
				globalThis.content.open([_component.parameters.action.article], { reset: true });
			});
		}

		const canvas = _component.use("success.canvas");
		const ctx = canvas.getContext("2d");

		let confetti = [];
		const confettiCount = 400;
		const gravity = 0.25;
		const terminalVelocity = 2.5;
		const drag = 0.075;
		const colors = [
			{ front: "red", back: "darkred" },
			{ front: "green", back: "darkgreen" },
			{ front: "blue", back: "darkblue" },
			{ front: "yellow", back: "darkyellow" },
			{ front: "orange", back: "darkorange" },
			{ front: "pink", back: "darkpink" },
			{ front: "purple", back: "darkpurple" },
			{ front: "turquoise", back: "darkturquoise" }
		];

		const randomize = (_min, _max) => {
			return Math.random() * (_max - _min) + _min;
		};

		const resize = () => {
			canvas.width = _component.clientWidth;
			canvas.height = _component.clientHeight;
		};

		const initConfetti = () => {
			for (let i = 0; i < confettiCount; i++) {
				confetti.push({
					color: colors[Math.floor(randomize(0, colors.length))],
					dimensions: { x: randomize(8, 12), y: randomize(8, 12) },
					position: { x: randomize(0, canvas.width), y: canvas.height - 1 },
					rotation: randomize(0, 2 * Math.PI),
					scale: { x: 1, y: 1 },
					velocity: { x: randomize(-25, 25), y: randomize(0, -50) }
				});
			}
		};

		const render = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			confetti.forEach((confetto, index) => {
				let width = confetto.dimensions.x * confetto.scale.x;
				let height = confetto.dimensions.y * confetto.scale.y;
				ctx.translate(confetto.position.x, confetto.position.y);
				ctx.rotate(confetto.rotation);

				confetto.velocity.x -= confetto.velocity.x * drag;
				confetto.velocity.y = Math.min(confetto.velocity.y + gravity, terminalVelocity);
				confetto.velocity.x += Math.random() > 0.5 ? Math.random() : -Math.random();
				confetto.position.x += confetto.velocity.x;
				confetto.position.y += confetto.velocity.y;

				if (confetto.position.y >= canvas.height) confetti.splice(index, 1);
				if (confetto.position.x > canvas.width) confetto.position.x = 0;
				if (confetto.position.x < 0) confetto.position.x = canvas.width;

				confetto.scale.y = Math.cos(confetto.position.y * 0.1);
				ctx.fillStyle = confetto.scale.y > 0 ? confetto.color.front : confetto.color.back;
				ctx.fillRect(-width / 2, -height / 2, width, height);
				ctx.setTransform(1, 0, 0, 1, 0, 0);
			});

			if (confetti.length <= 10) initConfetti();
			window.requestAnimationFrame(render);
		};

		resize();
		initConfetti();
		render();

		const resizeObserver = new ResizeObserver(_entries => resize());
		_component.on("disposing", () => resizeObserver.unobserve(_component));
		resizeObserver.observe(_component);
	}
};