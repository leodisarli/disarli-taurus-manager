FROM node:8-alpine

RUN apk --no-cache upgrade && apk add --no-cache tini

WORKDIR /opt/taurus

EXPOSE 4567

USER node

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npm", "start"]
