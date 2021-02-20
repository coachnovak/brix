import { button } from "/components/button.js";

export default {
	styles: `
		#doormat-steps { margin-bottom: 20px; text-align: center; }
		#doormat-intro { border: 1px solid var(--paper-3); margin-bottom: 20px; border-radius: 3px; outline: 0; }

		#doormat-list { margin: 0; margin-bottom: 40px; padding-left: 20px; }
		#doormat-list li { font-size: 11pt; margin-bottom: 10px; }
		#doormat-list li:last-child { margin-bottom: 0; }
		#doormat-actions { text-align: center; }
	`,

	markup: `
		<div>
			<div id="doormat-steps">
				<h2>Physical rooms, made digital, in three steps!</h2>
			</div>

			<video id="doormat-intro" src="/assets/intro.mp4" width="100%" controls>

			</video>

			<ol id="doormat-list">
				<li>Register to join.</li>
				<li>Create a room with a name.</li>
				<li>Invite your participants.</li>
			</ol>

			<div id="doormat-actions">
				<app-button id="doormat-register" text="Start here - register now" icon="check" composition="text icon"></app-button>
			</div>
		</div>
	`,

	script: async _component => {
		const registerElement = _component.use("doormat-register");
		registerElement.on("activated", async () => {
			globalThis.content.open([{ name: "register" }], { reset: true });
		});
	}
};