import { button } from "/components/button.js";

export default {
	styles: `
		#reactions-container-narrow { text-align: center; }

		#reactions-container-wide { display: block; visibility: hidden; height: 0; }
		#reactions-container-wide.reactable { visibility: visible; height: unset; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); overflow: hidden; }

		#reactions-container-wide > div { transform: translateY(-100%); transition-property: transform; transition-duration: 0.2s; transition-delay: 0.2s; }
		#reactions-container-wide.reactable > div { display: grid; grid-template-columns: repeat(6, auto); background: var(--paper-2); border-radius: 3px; padding: 5px; transform: translateY(0%); }

		@media all and (min-width: 476px) {
			#reactions-container-narrow { display: none; }

			#reactions-container-wide { visibility: visible; height: unset; }
			#reactions-container-wide > div { display: grid; grid-template-columns: repeat(6, auto); transform: translateY(0%); }
		}		
	`,

	markup: `
		<div id="reactions-container" class="reactions container">
			<div id="reactions-container-narrow">
				<app-button id="reactions-container-narrow-action" icon="thumbs-up" composition="icon" size="large" embedded="true"></app-button>
			</div>

			<div id="reactions-container-wide">
				<div id="reactions-container-wide-container">
					<app-button id="reactions-container-wide-like" reaction="like" icon="thumbs-up" composition="icon" size="large" embedded="true"></app-button>
					<app-button id="reactions-container-wide-heart" reaction="heart" icon="heart" composition="icon" size="large" embedded="true"></app-button>
					<app-button id="reactions-container-wide-laughing" reaction="laughing" icon="grin-squint" composition="icon" size="large" embedded="true"></app-button>
					<app-button id="reactions-container-wide-surprised" reaction="surprised" icon="surprise" composition="icon" size="large" embedded="true"></app-button>
					<app-button id="reactions-container-wide-sad" reaction="sad" icon="sad-tear" composition="icon" size="large" embedded="true"></app-button>
					<app-button id="reactions-container-wide-angry" reaction="angry" icon="angry" composition="icon" size="large" embedded="true"></app-button>
				</div>
			</div>
		</div>
	`,

	script: async _component => {
		// Close article if user isn't signed in.
		if (!localStorage.getItem("token")) return globalThis.article.close("reactions");

		const stream = _component.parameters.stream;

		const narrowElement = _component.use("reactions-container-narrow");
		const narrowActionElement = _component.use("reactions-container-narrow-action");

		const wideElement = _component.use("reactions-container-wide");
		const wideLikeElement = _component.use("reactions-container-wide-like");
		const wideHeartElement = _component.use("reactions-container-wide-heart");
		const wideLaughingElement = _component.use("reactions-container-wide-laughing");
		const wideSurprisedElement = _component.use("reactions-container-wide-surprised");
		const wideSadElement = _component.use("reactions-container-wide-sad");
		const wideAngryElement = _component.use("reactions-container-wide-angry");

		let reactionsCount = 0;
		let reactionsTimer = setInterval(() => {
			if (reactionsCount > 0) reactionsCount--;
		}, 2000);

		let reactableShowTimer = -1;
		narrowActionElement.on("activated", () => {
			wideElement.classList.add("reactable");
			clearTimeout(reactableShowTimer);
			reactableShowTimer = setTimeout(() => {
				wideElement.classList.remove("reactable");
			}, 4000);
		});

		let reactableHideTimer = -1;
		const react = function () {
			if (reactionsCount >= 3) return;
			const reactionToSend = this.getAttribute("reaction");
			stream.send("reaction", new reaction(reactionToSend));
			reactionsCount++;

			clearTimeout(reactableShowTimer);
			clearTimeout(reactableHideTimer);
			reactableHideTimer = setTimeout(() => {
				wideElement.classList.remove("reactable");
			}, 600);
		}

		wideLikeElement.on("activated", react);
		wideHeartElement.on("activated", react);
		wideLaughingElement.on("activated", react);
		wideSurprisedElement.on("activated", react);
		wideSadElement.on("activated", react);
		wideAngryElement.on("activated", react);

		const styleElement = document.createElement("style");
		styleElement.innerHTML = `
			canvas#reactions { position: absolute; left: 0; top: 0; opacity: 0.5; }
		`;

		const canvasElement = document.createElement("canvas");
		canvasElement.setAttribute("id", "reactions");

		const canvasContext = canvasElement.getContext("2d");
		const articleElement = document.querySelector("article");
		articleElement.insertBefore(canvasElement, articleElement.firstChild);
		articleElement.insertBefore(styleElement, articleElement.firstChild);

		const reactionsImage = new Image();
		reactionsImage.src = "/assets/reactions.png";

		const particles = [];
		let width, height;

		const randomize = (_min, _max) => {
			return Math.random() * (_max - _min) + _min;
		};

		const resize = () => {
			width = articleElement.clientWidth;
			height = articleElement.clientHeight;

			canvasElement.width = width;
			canvasElement.height = height;
		};

		const render = () => {
			canvasContext.clearRect(0, 0, width, height);

			let particleIndex = 0;
			while (particleIndex < particles.length) {
				let p = particles[particleIndex];
				p.x; p.y;

				if (p.x < 100) p.opacity -= 0.01;
				if (p.x < -100) particles.splice(particleIndex, 1);
				p.x -= p.speed * 10;

				canvasContext.save();
				canvasContext.globalAlpha = p.opacity;
				canvasContext.setTransform(p.scaleX, 0, 0, p.scaleY, p.x, p.y);
				canvasContext.drawImage(reactionsImage, (p.reactionType * 50) + 5, 5, 50, 50, 0, 0, 50, 50);
				canvasContext.restore();

				p.angle += 10;
				particleIndex++;
			}

			window.requestAnimationFrame(render);
		}

		class reaction {
			constructor(_reaction) {
				const reactions = ["like", "heart", "laughing", "surprised", "sad", "angry"];

				if (!_reaction) _reaction = reactions[Math.round(randomize(0, reactions.length - 1))];
				const reactionToUse = reactions.findIndex(_entry => _entry === _reaction);

				this.yp = randomize(-0.05, 0.95);
				this.angle = 0;
				this.speed = randomize(0.5, 0.1);

				this.scaleX = 0.5 + randomize(-0.1, 0.8);
				this.scaleY = this.scaleX;
				this.opacity = 1;

				this.delay = Math.round(randomize(3, 6));
				this.reactionType = reactionToUse;
			}
		};

		const reactionReceived = _event => {
			_event.detail.data.x = width;
			_event.detail.data.y = (height - 40) * _event.detail.data.yp;

			particles.push(_event.detail.data);
		};

		globalThis.on("reaction", reactionReceived);

		const resizeObserver = new ResizeObserver(_entries => resize());
		resizeObserver.observe(articleElement);

		_component.on("disposing", () => {
			clearInterval(reactionsTimer);

			// Dispose resize observer.
			resizeObserver.unobserve(articleElement);

			// Remove elements.
			canvasElement.remove();
			styleElement.remove();

			globalThis.off("reaction", reactionReceived);
		});

		resize();
		render();
	}
};