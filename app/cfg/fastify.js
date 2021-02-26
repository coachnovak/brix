import { ordinary, selfsigned } from "./certificates.js"

const fastify = {

};

if (process.env.production === "true") {
	if (process.env.usetls === "true") {
		// Load an ordinary certificate.
		const ordinaryCertificate = ordinary.load({
			location: process.env.certs,
			key: "privkey.pem",
			cert: "fullchain.pem"
		});

		// Apply certificates.
		fastify.https = { key: ordinaryCertificate.privateKey, cert: ordinaryCertificate.certificate };
	}
} else {
	if (process.env.usetls === "true") {
		// Create a self-signed certificate.
		const selfsignedCertificate = selfsigned.create({
			commonName: "brix.local",
			countryName: "SE",
			stateName: "Stockholm",
			locality: "Stockholm",
			orgName: "Contoso",
			orgUnit: "IT"
		});

		// Apply certificates.
		fastify.https = { key: selfsignedCertificate.privateKey, cert: selfsignedCertificate.certificate };
	}
}

export { fastify };