#---------------------build web------------------------
FROM docker.io/library/node:22-alpine AS build_web
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ---------------------build go--------------------
FROM golang:1.24-bullseye AS builder_go
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod tidy
COPY . .
COPY --from=build_web /app/frontend/dist /app/frontend/dist

RUN go generate ./...
RUN CGO_ENABLED=1 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o kpms-runner  ./cmd/main.go

#-----------------upx kpms-runner -----------------
FROM backplane/upx AS compressor
WORKDIR /app
COPY --from=builder_go /app/.env.example .
COPY --from=builder_go /app/runner .
RUN upx --best --lzma runner

#-------------------runner on debian (sqlite)--------------------------
FROM debian:bookworm-slim AS runner
WORKDIR /app
COPY --from=builder_go /app/kpms-runner .
COPY --from=builder_go /app/.env.example .
COPY --from=builder_go /app/config ./config
RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates && \
    rm -rf /var/lib/apt/lists/*
EXPOSE 65080
CMD ["./kpms-runner"]

