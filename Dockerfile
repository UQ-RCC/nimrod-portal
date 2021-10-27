FROM alpine:3.13.6 as builder
WORKDIR /app

COPY . .
RUN apk update
RUN apk add --no-cache npm
RUN npm install

FROM nginxinc/nginx-unprivileged:1.20
COPY --from=builder /app/ /usr/share/nginx/html/
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
