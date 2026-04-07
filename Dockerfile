FROM ubuntu:24.04

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    nginx=1.24.* && \
    rm -rf /var/lib/apt/lists/*

COPY ./index.html /var/www/html/index.html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]