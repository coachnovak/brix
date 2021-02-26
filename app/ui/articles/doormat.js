import { button } from "/components/button.js";

export default {
	options: {
		grow: true
	},

	styles: `
		#doormat-intro { border: 1px solid var(--paper-3); margin-bottom: 20px; border-radius: 3px; outline: 0; }

		#doormat-article { margin-bottom: 60px; text-align: justify; }
		#doormat-article-celebration { float: left; clip-path: circle(); shape-outside: circle(45%); margin: 20px 20px 20px 0; text-align: justify; position: relative; background: white; }
		#doormat-article-celebration { background-image: url(/assets/celebration.svg); background-size: contain; background-repeat: no-repeat; background-position: center center; padding: 60px; }

		#doormat-article-appreciation { float: right; clip-path: circle(); shape-outside: circle(45%); margin: 20px 0 20px 20px; padding: 10px; text-align: justify; position: relative; background: white; }
		#doormat-article-appreciation { background-image: url(/assets/appreciation.svg); background-size: contain; background-repeat: no-repeat; background-position: center center; padding: 60px; }

		#doormat-next { text-align: center; }
	`,

	markup: `
		<div>
			<video id="doormat-intro" src="/assets/intro.mp4" width="100%" controls>

			</video>

			<div id="doormat-article">
				<div id="doormat-article-celebration"><!-- --></div>
				<h3>Digital celebration</h3>
				<br />
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eget feugiat ante, sed condimentum risus. In luctus congue pretium. Quisque vel nisi vulputate, consequat neque vel, tristique risus. Nullam facilisis nunc facilisis, pellentesque tellus in, pretium ipsum. Proin eleifend condimentum velit, at tempus dolor. Vivamus in purus egestas, cursus tortor et, aliquam orci. Fusce eu purus neque. Curabitur metus lectus, ornare id elementum sed, varius vitae dui. Cras pellentesque leo ut tortor consectetur, a imperdiet nibh posuere. Ut non lacus vel purus elementum sagittis ut porttitor turpis. Nam sem magna, hendrerit eget felis sit amet, vestibulum ultrices elit.<br />
				<br />
				<div id="doormat-article-appreciation"><!-- --></div>
				<h3>Appreciation builds teams</h3>
				<br />
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eget feugiat ante, sed condimentum risus. In luctus congue pretium. Quisque vel nisi vulputate, consequat neque vel, tristique risus. Nullam facilisis nunc facilisis, pellentesque tellus in, pretium ipsum. Proin eleifend condimentum velit, at tempus dolor. Vivamus in purus egestas, cursus tortor et, aliquam orci. Fusce eu purus neque. Curabitur metus lectus, ornare id elementum sed, varius vitae dui. Cras pellentesque leo ut tortor consectetur, a imperdiet nibh posuere. Ut non lacus vel purus elementum sagittis ut porttitor turpis. Nam sem magna, hendrerit eget felis sit amet, vestibulum ultrices elit.
			</div>

			<div id="doormat-next">
				<app-button id="doormat-join" text="Join us" icon="check" composition="text icon"></app-button>
			</div>
		</div>
	`,

	script: async _component => {
		const joinElement = _component.use("doormat-join");
		joinElement.on("activated", async () => {
			globalThis.windows.open({ name: "register" });
		});
	}
};