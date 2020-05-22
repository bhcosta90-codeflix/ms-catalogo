FROM node:12.14.0-alpine3.11

RUN apk add --no-cache bash && \
    touch /root/.bashrc | echo "PS1='\w\$ '" >> /root/.bashrc && \
    npm install -g nodemon @loopback/cli && \
    mkdir -p /home/node/app

WORKDIR /home/node/app
