FROM node:15.10.0-alpine3.10

WORKDIR /brix

COPY package.json .
COPY . .

CMD ["node", "--inspect=0.0.0.0", "app/index.js"]