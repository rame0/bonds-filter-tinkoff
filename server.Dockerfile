FROM node:16-alpine as build-stage
WORKDIR /app
RUN npm install -g pnpm && rm -rf /root/.npm

ENV NODE_ENV=production
COPY server .

RUN pnpm install --frozen-lockfile --reporter append-only
RUN pnpm run build && rm -rf /app/src/


# Install --prod
FROM node:16-alpine as modules-fetch-stage
WORKDIR /app
RUN npm install -g pnpm && rm -rf /root/.npm

COPY server/package.json server/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod --no-optional && rm -rf /root/.pnpm

COPY --from=build-stage /app/dist /app/dist


# Runtime
FROM node:16-alpine as runtime-stage
WORKDIR /app

COPY --from=modules-fetch-stage /app /app

RUN mkdir /app/.cache
RUN chown -R node:node /app/.cache
USER node

CMD [ "/bin/sh", "-c", "./node_modules/.bin/moleculer-runner --config dist/moleculer.config.js dist/src/services/{**,**/**,**/**/**}/*.service.js"]
