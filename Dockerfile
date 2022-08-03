# syntax=docker/dockerfile:1

FROM node:slim

RUN corepack enable

WORKDIR /bnmofin-api

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .
COPY src src

ARG GOOGLE_APPLICATION_CREDENTIALS
COPY ${GOOGLE_APPLICATION_CREDENTIALS} google-credentials.json
ENV GOOGLE_APPLICATION_CREDENTIALS=google-credentials.json

RUN yarn; \
    yarn build

RUN rm -rf tsconfig.json src node_modules

RUN yarn cache clean; \
    yarn --production

CMD ["yarn", "start"]