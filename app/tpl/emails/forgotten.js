export default _data => {
	const {
		firstName,
		lastName,
		password
	} = _data;

	return {
		subject: `Hey ${firstName}, we heard you lost your password :)`,

		text: `
			Sorry to hear you lost your password ${firstName}!

			But don't worry, we got you covered. Here's a new one for you.

			${password}

			Sincerely,
			Brix
		`,

		html: `
			<html>
				<header>
					<style>
						body { font-family: Georgia; font-size: 9pt; }
					</style>
				</header>

				<body>
					Sorry to hear you lost your password ${firstName}!<br />
					<br />
					But don't worry, we got you covered. Here's a new one for you.<br />
					<br />
					<b>${password}</b><br />
					<br />
					Sincerely,<br />
					Brix Support
				</body>
			</html>
		`
	};
};