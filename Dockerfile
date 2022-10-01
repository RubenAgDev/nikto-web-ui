FROM alpine:3.15 AS builder

COPY nikto_program nikto

ENV PATH=${PATH}:/nikto

RUN echo 'Installing packages for Nikto.' \
  && apk add --update --no-cache --virtual .build-deps \
    perl \
    perl-net-ssleay
  # && echo 'Creating the nikto group.' \
  # && addgroup nikto \
  # && echo 'Creating the nikto user.' \
  # && adduser -G nikto -g "Nikto user" -s /bin/sh -D nikto \
  # && echo 'Changing the ownership.' \
  # && chown -R nikto.nikto /nikto

# USER nikto

RUN echo 'Installing NodeJS.' \
  && apk add --update --no-cache npm

WORKDIR /app
COPY package*.json ./
RUN npm ci
CMD [ "node", "src/index.js" ]
EXPOSE $PORT

FROM builder
COPY ./src/ ./src/
