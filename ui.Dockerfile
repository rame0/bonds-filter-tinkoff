FROM oven/bun:1.3.7-alpine AS build-stage
WORKDIR /app

RUN apk add --no-cache git

COPY UI .
COPY server/src/common/interfaces /app/src/external/interfaces

RUN bun install --frozen-lockfile
RUN bun run build


FROM nginx:alpine AS production-stage

COPY ./UI/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /app/dist /var/www/app

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
