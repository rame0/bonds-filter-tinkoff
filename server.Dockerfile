FROM oven/bun:1.3.7-alpine AS build-stage
WORKDIR /app

COPY server .

RUN bun install --frozen-lockfile
RUN bun run build && rm -rf /app/src/


# Install --prod
FROM oven/bun:1.3.7-alpine AS modules-fetch-stage
WORKDIR /app

ENV NODE_ENV=production

COPY server/package.json server/bun.lock ./
RUN bun install --frozen-lockfile --production

COPY --from=build-stage /app/dist /app/dist


# Runtime
FROM oven/bun:1.3.7-alpine AS runtime-stage
WORKDIR /app

COPY --from=modules-fetch-stage /app /app

RUN addgroup -S app && adduser -S app -G app && mkdir /app/.cache && chown -R app:app /app
USER app

CMD [ "bun", "./node_modules/.bin/moleculer-runner", "--config", "dist/moleculer.config.js", "dist/src/services/{**,**/**,**/**/**}/*.service.js" ]
