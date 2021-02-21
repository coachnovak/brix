import { list } from "/components/list.js";

export default {
	styles: `
		#estimate-effort-result-head { margin-bottom: 10px; text-align: center; }
		#estimate-effort-result-author { font-size: 7pt; text-align: center; margin-bottom: 20px; }
		#estimate-effort-result-waiting { text-align: center; }
		#estimate-effort-result-waiting.hide { display: none; }
		#estimate-effort-result-list[count="0"] { display: none; }
		#estimate-effort-result-actions { margin-top: 20px; display: grid; grid-template-columns: repeat(1, auto); justify-items: center; }
	`,

	markup: `
		<div id="estimate-effort-result">
			<div id="estimate-effort-result-head">
				<h3>Effort estimation result</h3>
			</div>

			<div id="estimate-effort-result-author">
				Turn <span id="estimate-effort-result-id"></span> was initiated by <span id="estimate-effort-result-by"></span>, <span id="estimate-effort-result-since"></span>.
			</div>

			<div id="estimate-effort-result-waiting">
				Waiting for results...
			</div>

			<app-list id="estimate-effort-result-list">

			</app-list>

			<div id="estimate-effort-result-actions">
				<app-button id="estimate-effort-result-actions-trash" icon="trash" text="Trash results" composition="vertical icon text" embedded="true"></app-button>
			</div>
		</div>
	`,

	script: async _component => {
		// Close article if user isn't signed in.
		if (!localStorage.getItem("token")) return globalThis.contents.close("estimate-effort-result");

		const turnidElement = _component.use("estimate-effort-result-id");
		const byElement = _component.use("estimate-effort-result-by");
		const sinceElement = _component.use("estimate-effort-result-since");
		const listElement = _component.use("estimate-effort-result-list");

		turnidElement.innerHTML = _component.parameters.turnid;
		byElement.innerHTML = _component.parameters.by;
		sinceElement.setAttribute("datetime", _component.parameters.when);
		timeago.render(sinceElement);

		const voters = [], votes = [];
		const voteEstimateWork = async _event => {
			if (_event.detail.data.turnid !== _component.parameters.turnid)
				return;

			// Find option for vote id.
			const option = _component.parameters.options.find(_option => _option.id === _event.detail.data.voteid);

			if (!voters.find(_voter => _voter.user._id === _event.detail.user._id)) {
				// New user vote caught.
				voters.push({
					user: _event.detail.user,
					option: option
				});

				if (!votes.find(_vote => _vote.id === option.id)) {
					votes.push({ id: option.id, count: 1, icon: option.icon, text: option.text });
				} else {
					const voteIndex = votes.findIndex(_vote => _vote.id === option.id);
					votes[voteIndex].count++;
				}
			}

			listElement.clear();

			// Sort votes.
			votes.sort(function (_a, _b) {
				return _a.value - _b.vote;
			});

			for (let voteIndex = 0; voteIndex < votes.length; voteIndex++) {
				const vote = votes[voteIndex];
				await listElement.add({
					id: vote.id,
					contents: [
						{ icon: vote.icon },
						{ text: vote.text },
						{ count: vote.count }
					]
				});
			}

			if (votes.length > 0)
				_component.use("estimate-effort-result-waiting").classList.add("hide");
		}

		_component.use("estimate-effort-result-actions-trash").on("activated", () => {
			globalThis.contents.close([
				"estimate-effort",
				"estimate-effort-turn",
				"estimate-effort-result"
			]);

			globalThis.contents.open([
				{
					name: "estimate-effort",
					parameters: {
						room: _component.parameters.room,
						stream: _component.parameters.stream
					}
				}
			]);
		});

		globalThis.on("vote-estimate-work", voteEstimateWork);

		_component.on("disposing", () => {
			globalThis.off("vote-estimate-work", voteEstimateWork);
		});
	}
};