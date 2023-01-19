FROM node:16

WORKDIR /reseller-backend

COPY . .

ENV PORT 4200

EXPOSE ${PORT}

RUN npm i && npm run build

CMD ["npm", "run", "start:prod"]