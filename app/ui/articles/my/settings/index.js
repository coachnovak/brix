import { component } from "/components/component.js";
import { textbox } from "/components/textbox.js";
import { cover } from "/components/cover.js";
import { avatar } from "/components/avatar.js";

export default {
	templates: () => {
		return {
			style: component.template`
				#layout { display: grid; grid-gap: var(--spacing); }
				#layout .row { position: relative; grid-column: 1 / -1; }

				app-cover { position: relative; left: calc(0px - var(--spacing)); top: calc(0px - var(--spacing)); width: calc(100% + (var(--spacing) * 2)); }
				app-avatar { position: absolute; left: 50%; top: 80%; transform: translate(-50%, -50%); }
				#update { position: absolute; left: 50%; transform: translateX(-50%); }

				@media (orientation: landscape) and (min-width: 600px) {
					#layout { grid-template-columns: repeat(auto-fill, calc(50% - 10px)); }
				}
			`,
		
			markup: component.template`
				<div id="layout">
					<div class="row">
						<app-cover size="m" clickable="true"></app-cover>
						<app-avatar size="m" clickable="true"></app-avatar>
					</div>

					<app-textbox id="email" autocomplete="email" class="row"></app-textbox>
					<app-textbox id="firstname" placeholder="Whats your first name" autocomplete="given-name"></app-textbox>
					<app-textbox id="lastname" placeholder="Whats your last name" autocomplete="family-name"></app-textbox>

					<div class="row">
						<app-button id="update" text="Save changes" icon="check" composition="text icon"></app-button>
					</div>
				</div>
			`
		};
	},

	script: async _component => {
		_component.find("app-cover").events.on("activated", () => {
			globalThis.windows.open({ name: "upload" }).events.on("upload", _files => {
				if (_files.length > 1) {
					globalThis.notify([{ icon: "exclamation-circle" }, { text: "You can only upload one file at the time." }]).close(3000);
				} else if (_files.length > 0) {
					const file = _files[0];
					const allowed = ["image/jpg", "image/jpeg", "image/png", "image/svg+xml", "image/webp"];

					// Ensure the file type is allowed.
					if (!allowed.includes(file.type)) globalThis.notify([{ icon: "exclamation-circle" }, { text: "You must select a valid image type." }]).close(3000);

					// Start sending the file.
					const filesForm = new FormData();
					filesForm.append("file", file);

					const progressNotification = globalThis.notify([
						{ icon: "file-upload" },
						{ text: "Uploading the cover for you..." },
						{ loader: { size: "xs" } },
						{ progress: { max: file.size, current: 0 } }
					]);

					globalThis.uploader(`/api/my/cover/`, {
						method: "post",
						body: filesForm
					}, {
						200: async _response => {
							progressNotification.close(2000);
							_component.find("app-cover").refresh();
						},
						400: async _response => {
							progressNotification.close();
							globalThis.notify([{ icon: "exclamation-circle" }, { text: _response.message }]).close(4000);
						}
					}, _progress => {
						progressNotification.progress(_progress.sent);
					});
				}
			});
		});

		_component.find("app-avatar").events.on("activated", () => {
			globalThis.windows.open({ name: "upload" }).events.on("upload", _files => {
				if (_files.length > 1) {
					globalThis.notify([{ icon: "exclamation-circle" }, { text: "You can only upload one file at the time." }]).close(3000);
				} else if (_files.length > 0) {
					const file = _files[0];
					const allowed = ["image/jpg", "image/jpeg", "image/png", "image/svg+xml", "image/webp"];

					// Ensure the file type is allowed.
					if (!allowed.includes(file.type)) globalThis.notify([{ icon: "exclamation-circle" }, { text: "You must select a valid image type." }]).close(3000);

					// Start sending the file.
					const filesForm = new FormData();
					filesForm.append("file", file);

					const progressNotification = globalThis.notify([
						{ icon: "file-upload" },
						{ text: "Uploading the avatar for you..." },
						{ loader: { size: "xs" } },
						{ progress: { max: file.size, current: 0 } }
					]);

					globalThis.uploader(`/api/my/avatar/`, {
						method: "post",
						body: filesForm
					}, {
						200: async _response => {
							progressNotification.close(2000);
							_component.find("app-avatar").refresh();
						},
						400: async _response => {
							progressNotification.close();
							globalThis.notify([{ icon: "exclamation-circle" }, { text: _response.message }]).close(4000);
						}
					}, _progress => {
						progressNotification.progress(_progress.sent);
					});
				}
			});
		});

		const emailElement = _component.find("#email");
		emailElement.events.on("activated", () => _component.find("#lastname").focus());
		emailElement.value = globalThis.session.identity.email;
		emailElement.readonly = true;

		const firstnameElement = _component.find("#firstname");
		firstnameElement.events.on("activated", () => _component.find("#lastname").focus());
		firstnameElement.value = globalThis.session.identity.firstName;
		firstnameElement.focus();

		const lastnameElement = _component.find("#lastname");
		lastnameElement.events.on("activated", () => _component.find("#update").events.emit("activated"));
		lastnameElement.value = globalThis.session.identity.lastName;

		_component.find("#update").events.on("activated", async () => {
			const firstnameValid = /^[a-zA-Z\u00C0-\u00ff]+$/i.test(firstnameElement.value);
			if (!firstnameValid) return globalThis.notify([{ icon: "exclamation-circle" }, { text: "Invalid first name provided." }]).close(3000);

			const lastnameValid = /^[a-zA-Z\u00C0-\u00ff]+$/.test(lastnameElement.value);
			if (!lastnameValid) return globalThis.notify([{ icon: "exclamation-circle" }, { text: "Invalid last name provided." }]).close(3000);

			await globalThis.fetcher(`/api/my/profile/`, {
				method: "put",
				body: JSON.stringify({
					firstName: firstnameElement.value,
					lastName: lastnameElement.value
				})
			}, {
				200: async _response => {
					globalThis.notify([{ icon: "exclamation-circle" }, { text: "You successfully updated your profile." }]).close(3000);
					globalThis.session.identify();
				},
				400: async _response => {
					const updateContent = _response.json();
					globalThis.notify([{ icon: "exclamation-circle" }, { text: updateContent.message }]).close(3000);
				}
			});
		});
	}
};