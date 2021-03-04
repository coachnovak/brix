```
$$$$$$$\  $$$$$$$\  $$$$$$\ $$\   $$\ 
$$  __$$\ $$  __$$\ \_$$  _|$$ |  $$ |
$$ |  $$ |$$ |  $$ |  $$ |  \$$\ $$  |
$$$$$$$\ |$$$$$$$  |  $$ |   \$$$$  / 
$$  __$$\ $$  __$$<   $$ |   $$  $$<  
$$ |  $$ |$$ |  $$ |  $$ |  $$  /\$$\ 
$$$$$$$  |$$ |  $$ |$$$$$$\ $$ /  $$ |
\_______/ \__|  \__|\______|\__|  \__|

by coachnovak

Join us at: https://brix.party/
Developers: https://github.com/coachnovak/brix/
```

# Setup dev env

## Prerequisites

* Expected to have a MongoDB instance set up with a database.
* Expected to have a Redis instance set up.

## Local setup

1. Clone this repo to your local device using the following command.

	```
	git clone https://github.com/coachnovak/brix.git
	```

2. Now prepare the npm environment using the following command.

	```
	npm install
	```

3. Next, if you are using Visual Studi Code, create a `launch.json` file underneath the folder `.vscode`.

4. The following runtime arguments needs to be set `launch.json` and should all be wrapped in quotes.
	* ***webport*** - Port number for the web server.

	* ***mongourl*** - MongoDB connect url, format: `mongodb://<username>:<password>@<ip>:<port>/<db>?authSource=<auth-db>&readPreference=primary&ssl=false`.

	* ***pubsub*** - Redis connect url for the pub/sub feature, format: `redis://admin:<password>@<ip>:<port>/<db-nr>`.

	* ***redis*** - Redis connect url for the general redis usage, format: `redis://admin:<password>@<ip>:<port>/<db-nr>`.
	
	* ***jwtsecret*** - Json web token encryption secret, format: `<18 character string using a-z, A-Z and 0-9>`.

	* ***certs*** - Folder where the domain certificate can be found, example: `/certs`.

	* ***production*** - Running in production or not, format: `<true or false>`. Use `false` in dev.
	
	* ***usetls*** - Use tls for web communication encryption, format: `<true or false>`. If this property is true and ***production*** is `false` the certificates are genereated using a built-in self-sign method.

	* ***smtpurl*** - Smtp connect url for e-mailing, format: `smtps://<username>:<password>@<server>[:port]/[?pool=true]`.

	* ***smtpfrom*** - E-mail address to use as sender, format: `recipient@domain.name`.

	* ***admincode*** - Admin code is used for setup access validation and can be any string. A strong code is recommended.