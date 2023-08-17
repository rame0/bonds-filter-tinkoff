FROM node:lts-alpine as build-stage
WORKDIR /app
RUN npm install -g pnpm && rm -rf /root/.npm

RUN apk add --no-cache git

COPY UI .
COPY server/src/common/innterfaces /app/src/external/interfaces

RUN pnpm install --frozen-lockfile --reporter append-only && rm -rf /root/.pnpm
RUN pnpm run build


# Install --prod
FROM node:16-alpine as modules-fetch-stage
WORKDIR /app
RUN npm install -g pnpm && rm -rf /root/.npm

COPY UI/package.json UI/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod --no-optional && rm -rf /root/.pnpm

COPY --from=build-stage /app/dist /app/dist


FROM nginx:alpine as production-stage

COPY ./UI/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=modules-fetch-stage /app/dist /var/www/app

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
