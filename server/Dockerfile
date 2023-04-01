FROM alpine AS build-deps

# install our needed dependencies
RUN apk update

RUN apk add nodejs
RUN apk add npm

RUN npm add -g yarn

# setup environment.
COPY * /usr/server/
WORKDIR /usr/server/

RUN yarn install

# start our lovely server.
ENTRYPOINT [ "node", "server.js" ]