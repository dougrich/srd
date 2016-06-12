FROM nginx

RUN rm /etc/nginx/conf.d/default.conf

COPY dist /var/www/app

COPY srd /var/www/app/srd

COPY srd.conf /etc/nginx/conf.d