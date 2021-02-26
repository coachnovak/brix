export default async (_app, _options) => {
	_app.get("/about/", async (_request, _response) => {
		_response.status(200).send({
			name: _app.definition.name,
			version: _app.definition.version,
			dependencies: _app.definition.dependencies
		});
	});
};