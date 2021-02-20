import { comment } from "/components/comment.js";

export default {
	options: {
		grow: true
	},

	styles: `
		#discussion-list-container { display: grid; grid-gap: 2px; position: absolute; left: 0; top: 0; right: 0; max-height: 100%; margin-right: 2px; }

		#discussion-list-container .item { display: grid; grid-gap: 5px 10px; grid-template-columns: min-content auto; grid-template-rows: auto auto; padding: 10px; border-radius: 3px; }
		#discussion-list-container .item { background-color: var(--paper-2); }

		#discussion-list-container .avatar { position: relative; width: 34px; height: 34px; border-radius: 50%; background: var(--paper-3); grid-area: 1 / 1 / 3 / 2; }
		#discussion-list-container .avatar i { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); }

		#discussion-list-container .publisher { position: relative; font-size: 7pt; font-weight: 700; grid-area: 1 / 2 / 3 / 3; }
		#discussion-list-container .text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; grid-area: 2 / 2 / 3 / 3; }
		#discussion-list-container .when { opacity: 0.75; position: absolute; top: 0; right: 0; }
	`,

	markup: `
		<div id="discussion-list-container">

		</div>
	`,

	script: async _component => {
		// Close article if user isn't signed in.
		if (!localStorage.getItem("token")) return globalThis.article.close("comments");

		const containerElement = _component.use("discussion-list-container");
		const newComment = (_event, _skipanimation = false) => {
			let scrollToBottom = _component.scrollTop === (_component.scrollHeight - _component.clientHeight);

			containerElement.appendChild(new comment({
				publisher: `${_event.detail.user.firstName} ${_event.detail.user.lastName}`,
				when: _event.detail.when,
				text: _event.detail.data
			}));

			if (scrollToBottom) setTimeout(() => _component.scrollTop = _component.scrollHeight, 50);
		}

		globalThis.on("comment", newComment);

		globalThis.article.open([{
			name: "room-discussion-new",
			parameters: { room: _component.parameters.room, stream: _component.parameters.stream }
		}]);

		_component.on("disposing", () => {
			globalThis.article.close("room-discussion-new");
			globalThis.off("comment", newComment);
		});

		// Load latest comments.
		const commentsResponse = await globalThis.fetcher(`/api/comments/${_component.parameters.room._id}`, { method: "get" });

		if (commentsResponse.status === 200) {
			const comments = await commentsResponse.json();
			comments.forEach(_comment => newComment({ detail: _comment }, true));
		}
	}
};