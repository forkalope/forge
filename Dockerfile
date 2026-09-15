FROM node:24-alpine AS web
WORKDIR /src/web
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

FROM golang:1.23-alpine AS server
WORKDIR /src
COPY go.mod ./
COPY cmd/ ./cmd/
COPY internal/ ./internal/
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /forkalope ./cmd/forkalope

FROM alpine:3.22
WORKDIR /app
COPY --from=server /forkalope /usr/local/bin/forkalope
COPY --from=web /src/web/dist ./web/dist
# This lab image runs as root so Containerlab can configure the emulated links.
RUN mkdir -p /var/lib/forkalope
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/forkalope"]
