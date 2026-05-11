FROM nginx:stable-alpine

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/
COPY casa-dei-cigni/ /usr/share/nginx/html/casa-dei-cigni/
COPY la-casetta/ /usr/share/nginx/html/la-casetta/
COPY olivetta-omgeving/ /usr/share/nginx/html/olivetta-omgeving/
COPY prijzen-beschikbaarheid/ /usr/share/nginx/html/prijzen-beschikbaarheid/
COPY bereikbaarheid-contact/ /usr/share/nginx/html/bereikbaarheid-contact/
COPY assets/ /usr/share/nginx/html/assets/

EXPOSE 80
