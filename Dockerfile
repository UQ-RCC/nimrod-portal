FROM alpine:3.13.6 as builder
WORKDIR /app

COPY . .
RUN apk update
RUN apk add --no-cache npm
RUN npm install

FROM nginx:1.21.3
COPY --from=builder /app/ /usr/share/nginx/html/
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

CMD nginx -g "daemon off;"