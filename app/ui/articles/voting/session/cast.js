import { component } from "/components/component.js";
import { button } from "/components/button.js";
import { progress } from "/components/progress.js";
import { loader } from "/components/loader.js";

export default {
	options: {
		position: "center"
	},

	templates: () => {
		return {
			style: component.template`
				:host([type]) { width: var(--size-s); }
		
				#layout { display: grid; grid-gap: 20px; }
				#expires { opacity: 0.6; }
			`,
		
			markup: component.template`
				<div id="layout">
					<h2 class="center">Cast your vote</h2>
		
					<div class="center">
						<span id="topic"></span> <span id="expires"></span>
					</div>
		
					<div class="center">
						<app-loader id="loader"></app-loader>
						<app-progress id="progress"></app-progress>
					</div>
		
					<app-list id="options"></app-list>
				</div>
			`
		};
	},

	script: async _component => {
		_component.shadow && _component.shadow.events.on("activated", async () => {
			_component.close("cancelled");
		});

		const sessionResponse = await globalThis.fetcher(`/api/voting/session/${_component.parameters.session}`, { method: "get" });
		if (sessionResponse.status !== 200) _component.close("error");
		const session = await sessionResponse.json();

		const topicElement = _component.find("#topic");
		topicElement.innerText = session.topic;

		const expiresElement = _component.find("#expires");
		const loaderElement = _component.find("#loader");
		loaderElement.visible = false;

		const progressElement = _component.find("#progress");
		progressElement.visible = false;

		if (session.expires === null) {
			expiresElement.innerText = "has no time limit.";
			loaderElement.visible = true;
			loaderElement.size = "s";			
		} else {
			expiresElement.innerText = `has a time limit of ${session.expires} seconds.`;
			progressElement.visible = true;
			progressElement.max = session.expires * 10;

			_component.timers.repeat(100, () => {
				if (progressElement.current >= progressElement.max)
					return _component.close("timeout");

				progressElement.current++;
			});
		}

		const optionsElement = _component.find("#options");
		for (let optionIndex = 0; optionIndex < session.options.length; optionIndex++) {
			const option = session.options[optionIndex];
			const optionElement = await optionsElement.add({
				id: `option-${option._id}`,
				data: option,
				contents: [
					{ icon: option.icon },
					{ text: option.label },
					{ arrow: true }
				]
			});

			optionElement.events.on("activated", async _event => {
				const beginResponse = await globalThis.fetcher(`/api/voting/session/${session._id}/vote/${_event.data._id}`, {
					method: "post",
					body: JSON.stringify({})
				});
	
				if (beginResponse.status === 200) {
					_component.close("voted");
				} else if (beginResponse.status >= 400) {
					const sessionContentFailure = await beginResponse.json();
					globalThis.notify([{ icon: "exclamation-circle" }, { text: sessionContentFailure.message }]).close(3000);
				}
			});
		}
	}
};