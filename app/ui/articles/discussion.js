import { comment } from "/components/comment.js";

export default {
	options: {
		grow: true
	},

	styles: `
		#discussion-list-container { display: grid; grid-gap: 5px; position: absolute; left: 0; top: 0; right: 0; max-height: 100%; }
	`,

	markup: `
		<div id="discussion-list-container">

		</div>
	`,

	script: async _component => {
		// Close article if user isn't signed in.
		if (!localStorage.getItem("token")) return globalThis.article.close("comments");

		const containerElement = _component.use("discussion-list-container");
		const newComment = _event => {
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
			name: "discussion-new",
			parameters: { room: _component.parameters.room, stream: _component.parameters.stream }
		}]);

		_component.on("disposing", () => {
			globalThis.article.close("discussion-new");
			globalThis.off("comment", newComment);
		});

		// Load latest comments.
		const commentsResponse = await globalThis.fetcher(`/api/comments/${_component.parameters.room._id}`, { method: "get" });

		if (commentsResponse.status === 200) {
			const comments = await commentsResponse.json();
			comments.forEach(_comment => newComment({ detail: _comment }));
		}
	}
};