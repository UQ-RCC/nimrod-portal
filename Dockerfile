FROM alpine:3.13.6 as builder
WORKDIR /app

COPY . .
RUN apk update
RUN apk add --no-cache npm
RUN npm install

FROM nginxinc/nginx-unprivileged:1.20
COPY --from=builder /app/ /usr/share/nginx/html/
RUN mkdir /tmp/client_temp && chmod -R g+w /tmp/client_temp
RUN mkdir /tmp/fastcgi_temp && chmod -R g+w /tmp/fastcgi_temp
RUN mkdir /tmp/proxy_temp && chmod -R g+w /tmp/proxy_temp
RUN mkdir /tmp/scgi_temp && chmod -R g+w /tmp/scgi_temp
RUN mkdir /tmp/uwsgi_temp && chmod -R g+w /tmp/uwsgi_temp
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
