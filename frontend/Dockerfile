FROM node:18-alpine

ARG VERSION
ARG COMMIT_HASH
ARG MAINTAINER

LABEL org.opencontainers.image.version=$VERSION \
      org.opencontainers.image.revision=$COMMIT_HASH \
      org.opencontainers.image.authors=$MAINTAINER \
      org.opencontainers.image.title="school-app-frontend"

WORKDIR /app

# Copy package.json first for caching
COPY package*.json ./

# Install dependencies (retries + ignore peer deps)
RUN npm install --legacy-peer-deps --retry=5

# Copy app source
COPY . .

# Build React app
RUN npm run build

# Install serve to run frontend
RUN npm install -g serve

EXPOSE 80

# Serve React build on port 80
CMD ["serve", "-s", "build", "-l", "80"]

