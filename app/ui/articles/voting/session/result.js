import { component } from "/components/component.js";
import { button } from "/components/button.js";
import { progress } from "/components/progress.js";

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
		
				#votes { display: grid; grid-gap: 5px; }
				#votes > div { display: grid; grid-gap: 15px; grid-template-columns: min-content auto min-content; padding: 15px; }
				#votes > div > app-progress { grid-column: 1 / -1; }
			`,
		
			markup: component.template`
				<div id="layout">
					<h2 class="center">Voting result</h2>
					<div class="center"><span id="topic"></span> <span id="expires"></span></div>
					<div class="center"><span id="notvoted"></span></div>
					<div id="votes"></div>
				</div>
			`
		};
	},

	script: async _component => {
		const summarize = (_array, _keys, _sort) => {
			let groups = {};
	
			_array.forEach(function (_out) {
				let group = JSON.stringify(_keys(_out));
				groups[group] = groups[group] || [];
				groups[group].push(_out);
			});
	
			groups = Object.keys(groups).map(_group => {
				return { key: groups[_group][0], length: groups[_group].length }
			});
	
			if (_sort) groups.sort(_sort);
			return groups;
		}

		const sessionResponse = await globalThis.fetcher(`/api/voting/session/${_component.parameters.session}`, { method: "get" });
		if (sessionResponse.status !== 200) _component.close("error");
		const session = await sessionResponse.json();

		// Remap votes and summarize votes.
		session.summary = session.votes.map(_vote => { return { option: _vote.option }; });
		session.summary = summarize(session.summary, _item => { return [_item.option]; }, (_first, _second) => _second.length - _first.length);

		const topicElement = _component.find("#topic");
		topicElement.innerText = session.topic;

		const expiresElement = _component.find("#expires");
		if (session.expires === null) expiresElement.innerText = "has no time limit.";
		else expiresElement.innerText = `has a time limit of ${session.expires} seconds.`;

		const notvotedElement = _component.find("#notvoted");
		const notvoted = session.participants.length - session.votes.length;
		if (notvoted === 0) notvotedElement.innerText = `Everyone casted their vote.`;
		else if (notvoted === 1) notvotedElement.innerText = `${notvoted} vote was not casted.`;
		else notvotedElement.innerText = `${notvoted} votes were not casted.`;

		const votesElement = _component.find("#votes");
		session.summary.forEach(_item => {
			const option = session.options.find(_option => _item.key.option === _option._id);
			const voteElement = document.createElement("div");
			const iconElement = voteElement.appendChild(document.createElement("i"));
			iconElement.classList.add("fad", `fa-${option.icon}`);

			const labelElement = voteElement.appendChild(document.createElement("div"));
			labelElement.innerText = option.label

			const countElement = voteElement.appendChild(document.createElement("div"));
			countElement.innerText = _item.length;

			voteElement.appendChild(new progress({ max: session.votes.length, current: _item.length }));
			votesElement.appendChild(voteElement);
		});
	}
};