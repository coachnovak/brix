import { pipeline } from "stream";

export default async (_app, _options) => {
	_app.get("/", {
		preValidation: [_app.authentication]
	}, async (_request, _response) => {
		const user = await _app.mongo.db
			.collection("users")
			.findOne({
				_id: new _app.mongo.objectid(_request.user.user),
				deleted: null
			}, {
				avatar: true
			});

		if (!user) return _response.status(401).send({ message: "Failed to obtain the identity, user wasn't found." });
		if (!user?.avatar?.fileid) return _response.status(404).send({ message: "User doesn't have an avatar." });

		// Get file from storage.
		const bucket = new _app.mongo.storage(_app.mongo.db, { bucketName: "avatars" });
		const downloadStream = bucket.openDownloadStream(user.avatar.fileid);
		return _response.type(user.avatar.mimetype).status(200).send(downloadStream);
	});

	_app.post("/", {
		preValidation: [_app.authentication]
	}, async (_request, _response) => {
		// Ensure the request is multipart.
		if (!_request.isMultipart()) return _response.status(400).send({ message: "Failed to upload avatar, request is not multipart." });

		// Limit avatars to 300kB.
		const upload = await _request.file({ throwFileSizeLimit: false, limits: { fileSize: 300000 } });

		// Ensure the mime type is valid.
		const allowedMimes = ["image/jpg", "image/jpeg", "image/png", "image/svg+xml", "image/webp"];
		if (!allowedMimes.includes(upload.mimetype)) return _response.status(400).send({ message: "Failed to upload avatar, not a valid image type." });

		// Write file to storage.
		const bucket = new _app.mongo.storage(_app.mongo.db, { bucketName: "avatars" });
		const userId = new _app.mongo.objectid(_request.user.user);
		const uploadStream = bucket.openUploadStream(upload.filename, { metadata: { user: userId }, contentType: upload.mimetype });
		const streamProgress = new Promise((_resolve, _reject) => {
			uploadStream.on("finish", () => _resolve());
			uploadStream.on("error", () => _reject());
		});

		upload.file.on("limit", async () => {
			_request.raw.unpipe(upload.file);
			await uploadStream.abort();
			return _response.status(400).send({ message: "Failed to upload avatar, file size limit reached." });
		});

		pipeline(upload.file, uploadStream, () => {});
		await streamProgress;

		// Update avatar file reference.
		await _app.mongo.db
			.collection("users")
			.updateOne({
				_id: userId,
				deleted: null
			}, {
				$set: {
					avatar: {
						fileid: uploadStream.id,
						filename: upload.filename,
						filesize: uploadStream.length,
						encoding: upload.encoding,
						mimetype: upload.mimetype
					}
				}
			});

		return _response.status(200).send({ message: "Success!" });
	});
};