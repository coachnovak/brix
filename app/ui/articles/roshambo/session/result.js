import { component } from "/components/component.js";
import { button } from "/components/button.js";
import { image } from "/components/image.js";

export default {
	options: {
		position: "center"
	},

	templates: () => {
		return {
			style: component.template`
				:host([type]) { width: var(--size-s); }
		
				#layout { display: grid; grid-gap: 20px; }

				#participants { display: grid; grid-gap: calc(var(--spacing) * 2); grid-template-columns: auto auto; justify-items: center; justify-content: center; }
				#initiator div,
				#opponent div { border-radius: 50%; background: var(--paper-3); border: 6px solid var(--paper-2); padding: var(--spacing); width: 116px; height: 116px; perspective: 1000px; }

				#initiator.won div,
				#opponent.won div { animation: spin 3s linear; animation-iteration-count: infinite; }

				@keyframes spin {
					from { transform: rotateY(0); }
					to { transform: rotateY(1turn); }
				}
			`,

			markup: component.template`
				<div id="layout">
					<h2 class="center">Roshambo result</h2>

					<div id="participants">
						<div id="initiator" class="center">
							<div id="initiatorRock"><app-image icon="hand-rock" size="64px"></app-image></div>
							<div id="initiatorPaper"><app-image icon="hand-paper" size="64px"></app-image></div>
							<div id="initiatorScissor"><app-image icon="hand-scissors" size="64px"></app-image></div>
							<br />
							You
						</div>

						<div id="opponent" class="center">
							<div id="opponentRock"><app-image icon="hand-rock" size="64px"></app-image></div>
							<div id="opponentPaper"><app-image icon="hand-paper" size="64px"></app-image></div>
							<div id="opponentScissor"><app-image icon="hand-scissors" size="64px"></app-image></div>
							<br />
							Opponent
						</div>
					</div>

					<h2 id="result" class="center"></h2>
				</div>
			`
		};
	},

	script: async _component => {
		await globalThis.fetcher(`/api/roshambo/session/${_component.parameters.session}`, {
			method: "get"
		}, {
			200: async _response => {
				const session = await _response.json();
				const me = session.result.find(_cast => _cast.caster === globalThis.session.identity._id);
				const opponent = session.result.find(_cast => _cast.caster !== globalThis.session.identity._id);

				const initiatorElement = _component.find("#initiator");
				const opponentElement = _component.find("#opponent");

				const initiatorRockElement = _component.find("#initiatorRock");
				initiatorRockElement.style.display = me.choice === "rock" ? "block" : "none";

				const initiatorPaperElement = _component.find("#initiatorPaper");
				initiatorPaperElement.style.display = me.choice === "paper" ? "block" : "none";

				const initiatorScissorElement = _component.find("#initiatorScissor");
				initiatorScissorElement.style.display = me.choice === "scissor" ? "block" : "none";

				const opponentRockElement = _component.find("#opponentRock");
				opponentRockElement.style.display = opponent.choice === "rock" ? "block" : "none";

				const opponentPaperElement = _component.find("#opponentPaper");
				opponentPaperElement.style.display = opponent.choice === "paper" ? "block" : "none";

				const opponentScissorElement = _component.find("#opponentScissor");
				opponentScissorElement.style.display = opponent.choice === "scissor" ? "block" : "none";

				const resultElement = _component.find("#result");

				const won = () => {
					initiatorElement.classList.add("won");
					resultElement.innerHTML = "You won!";
				};

				const lost = () => {
					opponentElement.classList.add("won");
					resultElement.innerHTML = "You've lost.";
				};

				const draw = () => {
					resultElement.innerHTML = "Nobody won, its a draw!";
				};

				switch (me.choice) {
					case "rock":
						switch (opponent.choice) {
							case "rock": draw(); break;
							case "paper": lost(); break;
							case "scissor": won(); break;
						}; break;

					case "paper":
						switch (opponent.choice) {
							case "rock": won(); break;
							case "paper": draw(); break;
							case "scissor": lost(); break;
						}; break;

					case "scissor":
						switch (opponent.choice) {
							case "rock": lost(); break;
							case "paper": won(); break;
							case "scissor": draw(); break;
						}; break;

				}
			},
			404: async _response => _component.close("error"),
			500: async _response => _component.close("error")
		});
	}
};