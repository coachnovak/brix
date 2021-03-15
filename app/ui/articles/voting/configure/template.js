import { button } from "/components/button.js";

export default {
	options: {
		position: "center"
	},

	styles: `
		#voting-template-configure { display: grid; grid-gap: 20px; }
		#voting-template-configure-expires { opacity: 0.5; }

		#voting-template-configure-buttons { display: grid; grid-gap: 20px; grid-template-columns: repeat(auto-fill, 100%); grid-column: 1 / -1; }
		#voting-template-configure-buttons app-button { width: 100%; }

		@media all and (min-width: 256px) {
			#voting-template-configure-buttons { grid-template-columns: repeat(auto-fill, calc(50% - 10px)); }
		}

		@media all and (min-width: 456px) {
			#voting-template-configure-buttons { grid-template-columns: repeat(auto-fill, 25%); }
		}
	`,

	markup: `
		<div id="voting-template-configure">
			<h2 id="voting-template-configure-name">Configure voting templates</h2>
			<div id="voting-template-configure-expires"></div>
			<app-list id="voting-template-configure-options"></app-list>
			<div id="voting-template-configure-buttons" class="center">
				<app-button id="voting-template-configure-delete" text="Delete" icon="times"s composition="text icon"></app-button>
				<app-button id="voting-template-configure-close" text="Close" composition="text" embedded="true"></app-button>
			</div>
		</div>
	`,

	script: async _component => {
		// Close article if user isn't signed in.
		if (!localStorage.getItem("token")) return _component.close("cancelled");

		if (_component.shadow) _component.shadow.once("activated", async () => {
			_component.close("cancelled");
		});

		const nameElement = _component.use("voting-template-configure-name");
		const expiresElement = _component.use("voting-template-configure-expires");
		const optionsElement = _component.use("voting-template-configure-options");

		const refresh = async () => {
			const templateResponse = await globalThis.fetcher(`/api/voting/template/${_component.parameters.template._id}`, { method: "get" });

			if (templateResponse.status !== 200) {
				globalThis.notify({ text: "We can't find the template you're trying to open." });
				return _component.close("error");
			}
	
			const template = await templateResponse.json();
			nameElement.innerText = template.name;
			expiresElement.innerText = template.expires === null ? `No session expiration` : `Session expires after ${template.expires}s`;
			optionsElement.clear();

			for (let optionIndex = 0; optionIndex < template.options.length; optionIndex++) {
				const option = template.options[optionIndex];
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
					const optionResponse = await globalThis.fetcher(`/api/voting/template/${_component.parameters.template._id}/option/${option._id}`, { method: "delete" });

					if (optionResponse.status === 200) refresh();
					else globalThis.notify({ text: "We couldn't delete the option." });
				});
			}
	
			const createElement = await optionsElement.add({
				id: "create",
				contents: [
					{ icon: "sparkles" },
					{ text: "Create an option" },
					{ arrow: true }
				]
			});
	
			createElement.on("activated", _event => {
				globalThis.windows
					.open({ name: "voting/configure/option/create", parameters: _component.parameters })
					.once("created", refresh);
			});
		};

		refresh();

		_component.use("voting-template-configure-delete").once("activated", async () => {
			const deleteResponse = await globalThis.fetcher(`/api/voting/template/${_component.parameters.template._id}`, { method: "delete" });

			if (deleteResponse.status === 200) _component.close("deleted");
			else globalThis.notify({ text: "We couldn't delete the template." });
		});

		_component.use("voting-template-configure-close").once("activated", () => {
			_component.close("cancelled");
		});

		_component.on("disposing", () => {

		});
	}
};