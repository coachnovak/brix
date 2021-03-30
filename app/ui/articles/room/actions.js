import anime from "/assets/scripts/anime.es.js";
import throttle from "/components/throttle.js";
import { component } from "/components/component.js";
import { button } from "/components/button.js";

export default {
	options: {
		position: "side",
		full: true
	},

	templates: () => {
		return {
			style: component.template`
				:host([type]) { padding: 0; }
		
				#actions { display: grid; grid-template-columns: repeat(3, auto); grid-gap: calc(var(--spacing) / 2); height: 100%; justify-content: center; align-content: center; }
				#actions app-button[size="huge"],
				#actions .divider { grid-column: 1 / -1; }
			`,
		
			markup: component.template`
				<div id="actions"></div>
			`
		};
	},

	script: async _component => {
		_component.shadow && _component.shadow.events.on("activated", async () => {
			_component.close("closed");
		});

		const doHandup = async () => {
			await globalThis.fetcher(`/api/participant/${_component.parameters.id}/handup/`, { method: "get" });
			handupAnimation.play();
			_component.timers.handup = setTimeout(async () => doHandup(), 1500);
		};

		const doHanddown = async () => {
			handupAnimation.pause();
			clearTimeout(_component.timers.handup);
		};

		const doHandshake = async () => {
			const doResponse = await globalThis.fetcher(`/api/participant/${_component.parameters.id}/handshake/`, { method: "get" });
			if (doResponse.status !== 200) _component.close("closed");
		};

		const doReact = throttle.setup(async (_reaction) => {
			await globalThis.fetcher(`/api/participant/${_component.parameters.id}/react/${_reaction}`, {
				method: "get"
			}, {
				500: _response => _component.close("closed")
			});
		}, 350);

		const doElement = _component.find("#actions");
		const handupElement = doElement.appendChild(new button({ icon: "hand-sparkles", text: "Raise my hand", composition: "vertical icon text", size: "huge", embedded: true }));

		const handupAnimation = anime({
			targets: handupElement,
			duration: 1200,
			translateY: ["0px", "-15px"],
			direction: "alternate",
			easing: "easeInBounce",
			autoplay: false,
			loop: true
		});

		handupElement.events.on("hold", doHandup);
		globalThis.events.on(["mouseup", "touchend"], doHanddown);
		_component.events.on("disposed", () => globalThis.events.off(["mouseup", "touchend"], doHanddown));

		doElement.appendChild(new button({ icon: "handshake", text: "Agree to something", composition: "vertical icon text", size: "huge", embedded: true })).events.on("activated", async () => doReact("handshake"));
		doElement.appendChild(new button({ icon: "thumbs-up", text: "Show you like it", composition: "vertical icon text", size: "huge", embedded: true })).events.on("activated", async () => doReact("thumbs-up"));

		const dividerElement = doElement.appendChild(document.createElement("div"));
		dividerElement.classList.add("divider");

		const dividerTextElement = dividerElement.appendChild(document.createElement("span"));
		dividerTextElement.innerText = "or";

		doElement.appendChild(new button({ icon: "grin-hearts", composition: "vertical icon", size: "large", embedded: true })).events.on("activated", async () => doReact("grin-hearts"));
		doElement.appendChild(new button({ icon: "grin-stars", composition: "vertical icon", size: "large", embedded: true })).events.on("activated", async () => doReact("grin-stars"));
		doElement.appendChild(new button({ icon: "grin-tears", composition: "vertical icon", size: "large", embedded: true })).events.on("activated", async () => doReact("grin-tears"));
		doElement.appendChild(new button({ icon: "grin-wink", composition: "vertical icon", size: "large", embedded: true })).events.on("activated", async () => doReact("grin-wink"));
		doElement.appendChild(new button({ icon: "grin-beam", composition: "vertical icon", size: "large", embedded: true })).events.on("activated", async () => doReact("grin-beam"));
		doElement.appendChild(new button({ icon: "frown", composition: "vertical icon", size: "large", embedded: true })).events.on("activated", async () => doReact("frown"));
		doElement.appendChild(new button({ icon: "sad-cry", composition: "vertical icon", size: "large", embedded: true })).events.on("activated", async () => doReact("sad-cry"));
		doElement.appendChild(new button({ icon: "angry", composition: "vertical icon", size: "large", embedded: true })).events.on("activated", async () => doReact("angry"));
		doElement.appendChild(new button({ icon: "poop", composition: "vertical icon", size: "large", embedded: true })).events.on("activated", async () => doReact("poop"));
	}
};