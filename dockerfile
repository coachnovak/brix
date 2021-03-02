FROM node

WORKDIR /brix

COPY package.json .
COPY . .

CMD ["node", "--inspect-brk=0.0.0.0", "app/index.js"]