import { options } from "/components/options.js";

export default {
	styles: `
		.failure.container { display: block; }
		.failure.container .head { }
		.failure.container h2 { color: rgb(255, 200, 200); }
	`,

	markup: `
		<div class="rooms container">
			<h2>Failed request</h2>
		</div>
	`,

	script: async _component => {

	}
};