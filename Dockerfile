FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache git ca-certificates

COPY . .

EXPOSE 8080

CMD ["node", "scripts/static-supervisor.js"]
