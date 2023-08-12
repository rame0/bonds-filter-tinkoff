FROM node:lts-alpine as build-stage
WORKDIR /app
RUN npm install -g pnpm && rm -rf /root/.npm

RUN apk add --no-cache git

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --reporter append-only && rm -rf /root/.pnpm

COPY . .
RUN pnpm run build



FROM nginx:alpine as production-stage
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /app/dist /var/www/app
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
