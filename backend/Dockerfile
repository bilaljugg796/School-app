FROM node:18-alpine

ARG VERSION
ARG COMMIT_HASH
ARG MAINTAINER

LABEL org.opencontainers.image.version=$VERSION \
      org.opencontainers.image.revision=$COMMIT_HASH \
      org.opencontainers.image.authors=$MAINTAINER \
      org.opencontainers.image.title="school-app-backend"

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3500

CMD ["node", "server.js"]

