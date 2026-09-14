# Multi‑stage: we only need the compose file for deployment
FROM docker/compose:2.27.0 AS deploy
WORKDIR /app
COPY docker-compose.yml .
COPY . .
CMD ["up", "-d"]
