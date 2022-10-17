FROM alpine:3.15 AS builder

ARG NIKTO_VERSION=2.5.0

RUN echo 'Downloading Nikto from GitHub...' \
  && wget -O - https://github.com/sullo/nikto/archive/nikto-${NIKTO_VERSION}.tar.gz \
    | tar xz --strip=1 "nikto-nikto-${NIKTO_VERSION}/program" \
  && mv program nikto

ENV PATH=${PATH}:/nikto

RUN echo 'Installing Dependencies: Perl and NodeJS...' \
  && apk add --update --no-cache --virtual .build-deps \
    perl \
    perl-net-ssleay \
    npm \
  && echo 'Creating the nikto group.' \
  && addgroup nikto \
  && echo 'Creating the nikto user.' \
  && adduser -G nikto -g "Nikto user" -s /bin/sh -D nikto \
  && echo 'Changing the ownership.' \
  && chown -R nikto.nikto /nikto

USER nikto

WORKDIR /app
COPY package*.json ./
RUN npm ci
CMD [ "node", "server/index.js" ]
EXPOSE $PORT

FROM builder
RUN npm run build
# TODO: Complete the Production build
# COPY ./.next/ ./
