FROM node:8 AS builder

WORKDIR /home/root/

ADD . join-frontend/

WORKDIR join-frontend/

RUN npm install \
&& npm run config \
&& npx ng build -prod -aot

FROM nginx

COPY --from=builder /home/root/join-frontend/dist/ /usr/share/nginx/html
COPY ./default.conf /etc/nginx/sites-available/
