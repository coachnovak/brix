export default {
	options: {
		grow: true
	},

	styles: `
		#room-history-visualization { position: absolute !important; left: 0; top: 0; right: 0; height: 100%;  }

		.vis-timeline { border: 0; }
		.vis-item { font-size: 8pt; background-color: var(--paper-3); color: var(--pen-3); border: 0; }
		.vis-item-content { padding: 8pt !important; }
		.vis-item.vis-selected { background-color: var(--paper-4); color: var(--pen-4); border-color: var(--paper-4); }
		.vis-item.vis-line { color: var(--paper-3); }
		.vis-item.vis-line.vis-selected { color: var(--paper-4); }
		.vis-time-axis .vis-text { font-size: 8pt; color: var(--pen-1); }

		.vis-time-axis .vis-grid.vis-saturday,
		.vis-time-axis .vis-grid.vis-sunday { background: var(--paper-2); }

		.vis-time-axis .vis-grid.vis-vertical { border-left: 1px solid var(--paper-3) !important; }
	`,

	markup: `
		<div id="room-history-visualization"></div>
	`,

	script: async _component => {
		// Close article if user isn't signed in.
		if (!localStorage.getItem("token")) return _component.close();

		const start = new Date();
		start.setHours(start.getHours() - 2);

		const end = new Date();
		end.setHours(end.getHours() + 2);

		const roomTimelineVisualizationElement = _component.use("room-history-visualization");
		const timeline = new vis.Timeline(roomTimelineVisualizationElement, [], {
			start: start,
			end: end,
			height: "100%"
		});

		_component.on("disposing", () => {
			timeline.destroy();
		});

		const eventsResponse = await globalThis.fetcher(`/api/events/${_component.parameters.room._id}`, { method: "get" });

		if (eventsResponse.status >= 200 && eventsResponse.status <= 399) {
			const events = await eventsResponse.json();
			timeline.setItems(events);
		}
	}
};