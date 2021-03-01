import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";
import forge from "node-forge";

export class ordinary {
	static load ({ location, key, cert }) {
		const keyContent = fs.readFileSync(path.join(location, key));
		const certContent = fs.readFileSync(path.join(location, cert));

		return {
			privateKey: keyContent,
			certificate: certContent
		};
	}
}

export class selfsigned {
	static create (_options) {
		const options = _options ?? {};
		const keys = forge.pki.rsa.generateKeyPair(2048);
		const cert = forge.pki.createCertificate();
		cert.publicKey = keys.publicKey;
		cert.serialNumber = `01${crypto.randomBytes(19).toString("hex")}`;
		cert.validity.notBefore = new Date();
		cert.validity.notAfter = new Date();
		cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
	
		const attributes = [
			{ name: "commonName", value: options?.commonName },
			{ name: "countryName", value: options?.countryName },
			{ shortName: "ST", value: options?.stateName },
			{ name: "localityName", value: options?.locality },
			{ name: "organizationName", value: options?.orgName },
			{ shortName: "OU", value: options?.orgUnit }
		];
	
		cert.setSubject(attributes);
		cert.setIssuer(attributes);
		cert.setExtensions([
			{ name: "basicConstraints", cA: true },
			{ name: "keyUsage", keyCertSign: true, digitalSignature: true, nonRepudiation: true, keyEncipherment: true, dataEncipherment: true },
			{ name: "extKeyUsage", serverAuth: true, clientAuth: true, codeSigning: true, emailProtection: true, timeStamping: true },
			{ name: "nsCertType", client: true, server: true, email: true, objsign: true, sslCA: true, emailCA: true, objCA: true },
			{ name: "subjectKeyIdentifier" },
			{
				name: "subjectAltName",
				altNames: [{
					type: 6,
					value: "brix.local"
				}].concat((() => {
					const ips = [], interfaces = os.networkInterfaces();
					Object.keys(interfaces).forEach(_interface => interfaces[_interface].forEach(_item => ips.push({ type: 7, ip: _item.address })))
					return ips;
				})())
			}
		]);
	
		cert.sign(keys.privateKey);

		return {
			privateKey: forge.pki.privateKeyToPem(keys.privateKey),
			publicKey: forge.pki.publicKeyToPem(keys.publicKey),
			certificate: forge.pki.certificateToPem(cert)
		};
	}
}