FROM node:16

RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

WORKDIR /reseller-backend

COPY . .

ENV PORT 4200

EXPOSE ${PORT}

RUN pnpm install && pnpm build

CMD ["pnpm", "start:prod"]