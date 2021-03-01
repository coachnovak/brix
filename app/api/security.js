import bcrypt from "bcrypt";
import crypto from "crypto";

export default async (_app, _options) => {
	const hashPassword = async ({ password, salt }) => {
		salt = salt ?? await bcrypt.genSalt();
		const hash = await bcrypt.hash(password, salt);
		return { salt, hash };
	}

	_app.post("/authenticate/", {
		schema: {
			body: {
				type: "object",
				properties: {
					email: { type: "string", description: "An e-mail address of a registered user." },
					password: { type: "string", description: "The password related to the e-mail address." }
				}
			}
		}
	}, async (_request, _response) => {
		let { email, password } = _request.body;
		if (!email || !password) return _response.status(400).send({ message: "Missing mandatory parameters" });

		const emailValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email);
		const passwordValid = password !== "";
		if (!emailValid) { _response.status(400).send({ message: "Provided e-mail is invalid." }); return; }
		if (!passwordValid) { _response.status(400).send({ message: "Provided password is invalid." }); return; }

		email = email.toLowerCase();
		const user = await _app.mongo.db.collection("users").findOne({ email, deleted: null });

		if (!user) {
			return _response.status(401).send({ message: "Authentication failed, user wasn't found." });
		} else {
			if (user.confirmed === null)
				return _response.status(400).send({ message: "The user account must be activated before first use." });

			const result = await hashPassword({ password, salt: user.salt });
			if (user.password !== result.hash) return _response.status(401).send({ message: "Authentication failed, invalid credentials." });

			const expiresInSeconds = 86400;
			const expires = new Date();
			expires.setSeconds(expires.getSeconds() + (expiresInSeconds - 6));

			const salt = crypto.randomBytes(128).toString("hex");
			const token = _app.jwt.sign({
				user: user._id.toString(),
				salt
			}, {
				expiresIn: expiresInSeconds
			});

			const response = await _app.mongo.db.collection("sessions").insertOne({ user: user._id, token, salt });
			if (response?.result?.ok !== 1) return _response.status(500).send({ message: "Failed to store session" });

			 _response.status(201).send({ token, expires });
		}
	});

	_app.post("/register/", {
		schema: {
			body: {
				type: "object",
				properties: {
					email: { type: "string", description: "An e-mail address to use for authentication." },
					password: { type: "string", description: "A password to use when authenticating." },
					firstName: { type: "string", description: "The first name or given name of the user." },
					lastName: { type: "string", description: "The last name or surname of the user." }
				}
			}
		}
	}, async (_request, _response) => {
		let { email, password, firstName, lastName } = _request.body;

		if (!email || !password || !firstName || !lastName)
			return _response.status(400).send("Missing mandatory parameters");

		const emailValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email);
		const passwordValid = password !== "";
		const firstNameValid = /^[a-zA-Z\u00C0-\u00ff]+$/i.test(firstName);
		const lastNameValid = /^[a-zA-Z\u00C0-\u00ff]+$/.test(lastName);
		if (!emailValid) { _response.status(400).send({ message: "Provided e-mail is invalid." }); return; }
		if (!passwordValid) { _response.status(400).send({ message: "Provided password is invalid." }); return; }
		if (!firstNameValid) { _response.status(400).send({ message: "Provided first name is invalid." }); return; }
		if (!lastNameValid) { _response.status(400).send({ message: "Provided last name is invalid." }); return; }

		email = email.toLowerCase();
		const existingUser = await _app.mongo.db.collection("users").findOne({ email, deleted: null });
		if (existingUser) return _response.status(400).send({ message: "Provided e-mail is already in use." });

		const hashedPassword = await hashPassword({ password });
		const confirmCode = crypto.randomBytes(40).toString("hex");

		const registrationResponse = await _app.mongo.db.collection("users").insertOne({
			email,
			password: hashedPassword.hash,
			salt: hashedPassword.salt,
			firstName,
			lastName,
			registered: new Date(),
			confirmed: null,
			confirmCode,
			deleted: null
		});

		if (registrationResponse?.result?.ok !== 1)
			return _response.status(500).send({ message: "Failed to register user." });

		// Send an e-mail for confirmation.
		const from = process.env.smtpfrom;

		const emailResponse = await _app.email.send({
			from,
			to: email,
			template: "confirmation",
			data: {
				firstName,
				lastName,
				confirmCode
			}
		});

		return _response.status(201).send({ message: "Success!" });
	});

	_app.post("/forgot/", async (_request, _response) => {
		let { email } = _request.body;

		if (!email)
			return _response.status(400).send("Missing mandatory parameters");

		const emailValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email);
		if (!emailValid) { _response.status(400).send({ message: "Provided e-mail is invalid." }); return; }

		email = email.toLowerCase();
		const user = await _app.mongo.db.collection("users").findOne({ email, confirmed: { $ne: null }, deleted: null });
		if (!user) return _response.status(400).send({ message: "Provided e-mail was not found." });

		const password = crypto.randomBytes(16).toString("hex");
		const hashedPassword = await hashPassword({ password, salt: user.salt });

		const forgottenResponse = await _app.mongo.db.collection("users").updateOne({ _id: user._id }, { $set: { password: hashedPassword.hash } });
		if (forgottenResponse?.result?.ok !== 1) return _response.status(500).send({ message: "Failed to reset the password." });

		// Send an e-mail with reset password.
		const from = process.env.smtpfrom;

		const emailResponse = await _app.email.send({
			from,
			to: user.email,
			template: "forgotten",
			data: {
				firstName: user.firstName,
				lastName: user.lastName,
				password
			}
		});

		return _response.status(200).send({ message: "Success!" });
	});

	_app.get("/activate/:confirmCode", async (_request, _response) => {
		const user = await _app.mongo.db.collection("users").findOne({ confirmCode: _request.params.confirmCode, deleted: null });
		if (!user) _response.status(404).send({ message: "Confirmation code couln't be used." });
		if (user.confirmed !== null) return _response.redirect("/");

		const response = await _app.mongo.db.collection("users").updateOne({ _id: user._id }, { $set: { confirmed: new Date() } });
		if (response.result?.ok !== 1) return _response.status(500).send({ message: "Failed to activate your account." });

		return _response.redirect("/");
	});

	_app.get("/identify/", {
		preValidation: [_app.authentication]
	}, async (_request, _response) => {
		const user = await _app.mongo.db.collection("users").findOne({ _id: new _app.mongo.ObjectId(_request.user.user), deleted: null });

		if (!user)
			return _response.status(401).send({ message: "Failed to obtain the identity, user wasn't found." });
		else if (user.confirmed === null)
			return _response.status(400).send({ message: "The user account must be activated before first use." });

		return _response.status(200).send(user);
	});
};