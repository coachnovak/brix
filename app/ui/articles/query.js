import { component } from "/components/component.js";
import { button } from "/components/button.js";
import { textbox } from "/components/textbox.js";
import { tags } from "/components/tags.js";

export default {
	options: {
		position: "center"
	},

	templates: () => {
		return {
			style: component.template`
				:host([type]) { width: var(--size-s); }

				#layout { display: grid; grid-gap: var(--spacing); }
				#actions app-button { width: 100%; }

				@media (orientation: landscape) {
					#actions app-button { width: unset; position: relative; left: 50%; transform: translateX(-50%); }
				}
			`,

			markup: component.template`
				<div id="layout">
					<h2>Search</h2>

					<app-textbox id="name" placeholder="Name to search for"></app-textbox>
					<h3>Tags to search for</h3>
					<app-tags id="tags" fontsize="n" uppercase="true" composition="text" secondary="true"></app-tags>

					<div id="actions">
						<app-button id="continue" text="Go search" icon="search" composition="text icon"></app-button>
					</div>
				</div>
			`
		};
	},

	script: async _component => {
		_component.shadow && _component.shadow.events.on("activated", async () => {
			_component.close("cancelled");
		});

		const nameElement = _component.find("#name");
		nameElement.focus();

		const tagsElement = _component.find("#tags");
		tagsElement.addable = true;

		tagsElement.events.on("saved", async _value => {
			if (_value === "") return;
			tagsElement.add({ id: `item_${_value}`, text: `#${_value}` });
		});

		tagsElement.events.on("activated", async _id => {
			tagsElement.find(_id).remove();
		});

		_component.find("#continue").events.on("activated", async _id => {
			const labels = tagsElement.list().map(_tag => _tag.replace("item_", ""));

			globalThis.contents.close();
			globalThis.contents.open({
				name: `rooms/search`,
				parameters: { name: nameElement.value, labels: labels.join(" ") }
			});

			_component.close();
		});
	}
};