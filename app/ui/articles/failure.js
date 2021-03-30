import { component } from "/components/component.js";
import { options } from "/components/options.js";

export default {
	templates: () => {
		return {
			style: component.template`
				.failure.container { display: block; }
				.failure.container .head { }
				.failure.container h2 { color: rgb(255, 200, 200); }
			`,
		
			markup: component.template`
				<div class="rooms container">
					<h2>Failed request</h2>
				</div>
			`
		};
	},

	script: async _component => {

	}
};