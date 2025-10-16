# Build Stage
FROM denoland/deno:latest AS builder

ARG GIT_REVISION
ENV DENO_DEPLOYMENT_ID=${GIT_REVISION}

WORKDIR /app

COPY . .
RUN deno task build:web:production
RUN deno cache _fresh/server.js

# Serve Stage
FROM denoland/deno:alpine

LABEL org.opencontainers.image.source https://github.com/calmez/oot-save-edit

ARG GIT_REVISION
ENV DENO_DEPLOYMENT_ID=${GIT_REVISION}

WORKDIR /app

# Copy only the built app and cached dependencies from builder
COPY --from=builder /app/_fresh .

EXPOSE 8000

CMD ["serve", "-A", "./server.js"]