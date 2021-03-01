import nodemailer from "nodemailer";
import templates from "./../emails/index.js";
import fastifyPlugin from "fastify-plugin";

export default fastifyPlugin (async (_app, _options) => {
	const defaults = {
		url: process.env.smtpurl,
		from: process.env.smtpfrom
	};

	const email = {};
	email.send = async ({ from, to, template, data, attachments }) => {
		const transporter = nodemailer.createTransport(defaults.url, {
			tls:{ rejectUnauthorized: false }
		});

		const templateToUse = templates[template](data);

		return await transporter.sendMail({
			from: from ?? defaults.from, to,
			subject: templateToUse.subject,
			text: templateToUse.text,
			html: templateToUse.html,
			attachments
		});
	};

	_app.decorate("email", email);
});