FROM node:16

WORKDIR /reseller-backend

COPY . .

ENV PORT 4200

EXPOSE ${PORT}

RUN pnpm install && pnpm build

CMD ["pnpm", "start:prod"]