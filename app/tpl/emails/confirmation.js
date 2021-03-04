export default _data => {
	const {
		firstName,
		lastName,
		confirmCode
	} = _data;

	return {
		subject: `Welcome to Brix ${firstName}!`,

		text: `
			Glad to have you onboard ${firstName}!

			Please copy and paste this link to your browser to activate your account and start enjoying our services.

			https://brix.party/api/security/activate/${confirmCode}

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
					Glad to have you onboard ${firstName}!<br />
					<br />
					Please follow the link to activate your account and start enjoying our services.<br />
					<br />
					<a href="https://brix.party/api/security/activate/${confirmCode}">Activate account</a><br />
					<br />
					Sincerely,<br />
					Brix Support
				</body>
			</html>
		`
	};
};