ARG NODE_VERSION=20
ARG ALPINE_VERSION=3.20

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION}

LABEL maintainer="Axel Cvjetic"

RUN apk add --no-cache openssl \ 
    && apk update

WORKDIR /bot

COPY package*.json ./
COPY .husky/ ./.husky/
COPY prisma/ ./prisma/

RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev \
    && npm cache clean --force

USER node

COPY . .

CMD ["npm", "start"]