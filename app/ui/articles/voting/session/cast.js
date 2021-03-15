import { button } from "/components/button.js";
import { loader } from "/components/loader.js";
import { progress } from "/components/progress.js";

export default {
	options: {
		position: "center"
	},

	styles: `
		#voting-session-cast { display: grid; grid-gap: 20px; }
		#voting-session-cast-expires { opacity: 0.6; }
	`,

	markup: `
		<div id="voting-session-cast">
			<h2 class="center">Cast your vote</h2>
			<div class="center"><span id="voting-session-cast-topic"></span> <span id="voting-session-cast-expires"></span></div>
			<div class="center">
				<app-loader id="voting-session-cast-loader"></app-loader>
				<app-progress id="voting-session-cast-progress"></app-progress>
			</div>
			<app-list id="voting-session-cast-options"></app-list>
			<div class="center"><app-button id="voting-session-cast-cancel" text="Cancel" composition="text" embedded="true"></app-button></div>
		</div>
	`,

	script: async _component => {
		// Close article if user isn't signed in.
		if (!localStorage.getItem("token")) return _component.close("cancelled");

		if (_component.shadow) _component.shadow.once("activated", async () => {
			_component.close("cancelled");
		});

		const sessionResponse = await globalThis.fetcher(`/api/voting/session/${_component.parameters.session}`, { method: "get" });
		if (sessionResponse.status !== 200) _component.close("error");
		const session = await sessionResponse.json();

		const topicElement = _component.use("voting-session-cast-topic");
		topicElement.innerText = session.topic;

		const expiresElement = _component.use("voting-session-cast-expires");
		const loaderElement = _component.use("voting-session-cast-loader");
		const progressElement = _component.use("voting-session-cast-progress");

		if (session.expires === null) {
			expiresElement.innerText = "has no time limit.";
			loaderElement.once("ready", () => loaderElement.visible = true);
			loaderElement.size = "s";
			progressElement.visible = false;
		} else {
			expiresElement.innerText = `has a time limit of ${session.expires} seconds.`;
			progressElement.once("ready", () => progressElement.visible = true);
			progressElement.max = session.expires;
			loaderElement.visible = false;

			_component.timers.progress = setInterval(() => {
				progressElement.current++;

				if (progressElement.current >= progressElement.max)
					_component.close("timeout");
			}, 1000);

			_component.once("disposing", () => {
				clearInterval(_component.timers.progress);
			});
		}

		const optionsElement = _component.use("voting-session-cast-options");
		for (let optionIndex = 0; optionIndex < session.options.length; optionIndex++) {
			const option = session.options[optionIndex];
			const optionElement = await optionsElement.add({
				id: option._id,
				data: option,
				contents: [
					{ icon: option.icon },
					{ text: option.label },
					{ arrow: true }
				]
			});

			optionElement.on("activated", async _event => {
				const beginResponse = await globalThis.fetcher(`/api/voting/session/${session._id}/vote/${_event.detail._id}`, {
					method: "post",
					body: JSON.stringify({})
				});
	
				if (beginResponse.status === 200) {
					_component.close("voted");
				} else if (beginResponse.status >= 400) {
					const sessionContentFailure = await beginResponse.json();
					globalThis.notify({ icon: "exclamation-circle", text: sessionContentFailure.message });
				}
			});
		}

		_component.use("voting-session-cast-cancel").once("activated", () => {
			_component.close("cancelled");
		});
	}
};