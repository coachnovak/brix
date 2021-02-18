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
		const passwordValid = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/.test(password);
		if (!emailValid) { _response.status(400).send({ message: "Provided e-mail is invalid." }); return; }
		if (!passwordValid) { _response.status(400).send({ message: "Provided password is invalid." }); return; }

		email = email.toLowerCase();
		const user = await _app.mongo.db.collection("users").findOne({ email });

		if (!user) {
			return _response.status(401).send({ message: "Authentication failed, user wasn't found." });
		} else {
			const result = await hashPassword({ password, salt: user.salt });
			if (user.password !== result.hash) return _response.status(401).send({ message: "Authentication failed, invalid credentials." });

			const expiresInSeconds = 86400;
			const salt = crypto.randomBytes(128).toString("hex");
			const token = _app.jwt.sign({
				user: user._id.toString(),
				salt
			}, {
				expiresIn: expiresInSeconds
			});

			const response = await _app.mongo.db.collection("sessions").insertOne({ user: user._id, token, salt });
			if (response?.result?.ok !== 1) return _response.status(500).send("Failed to store session");

			return _response.status(201).send(token);
		}
	});

	_app.post("/register/", async (_request, _response) => {
		let { email, password, firstName, lastName } = _request.body;

		if (!email || !password || !firstName || !lastName)
			return _response.status(400).send("Missing mandatory parameters");

		const emailValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email);
		const passwordValid = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/.test(password);
		const firstNameValid = /^[a-zA-Z\u00C0-\u00ff]+$/i.test(firstName);
		const lastNameValid = /^[a-zA-Z\u00C0-\u00ff]+$/.test(lastName);
		if (!emailValid) { _response.status(400).send({ message: "Provided e-mail is invalid." }); return; }
		if (!passwordValid) { _response.status(400).send({ message: "Provided password is invalid." }); return; }
		if (!firstNameValid) { _response.status(400).send({ message: "Provided first name is invalid." }); return; }
		if (!lastNameValid) { _response.status(400).send({ message: "Provided last name is invalid." }); return; }

		email = email.toLowerCase();

		const result = await hashPassword({ password });
		const response = await _app.mongo.db.collection("users").insertOne({ email, password: result.hash, salt: result.salt, firstName, lastName });
		if (response?.result?.ok !== 1) return _response.status(500).send("Failed to register user.");

		return _response.status(201).send();
	});

	_app.get("/identify/", {
		preValidation: [_app.authentication]
	}, async (_request, _response) => {
		const user = await _app.mongo.db.collection("users").findOne({ _id: new _app.mongo.ObjectId(_request.user.user) });
		return _response.status(200).send(user);
	});
};