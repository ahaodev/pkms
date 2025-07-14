#---------------------build web------------------------
# Frontend build stage (architecture-agnostic)
FROM docker.io/library/node:22-alpine AS build_web
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# 使用基于 Debian 的镜像，自带完整的构建环境
FROM --platform=linux/amd64 golang:1.24-bullseye AS builder_go
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go generate ./...
COPY --from=build_web /app/frontend/dist /app/frontend/dist
RUN CGO_ENABLED=1 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o runner ./cmd/main.go

#-------------------压缩二进制文件------------------------
FROM backplane/upx AS compressor
WORKDIR /app
COPY --from=builder_go /app/runner .
RUN upx --best --lzma runner

#-------------------runner--------------------------
# Runtime stage
FROM alpine:3.22 AS runner
# Healthcheck
HEALTHCHECK CMD /usr/bin/timeout 5s /bin/sh -c "/usr/bin/wg show | /bin/grep -q interface || exit 1" --interval=1m --timeout=5s --retries=3
WORKDIR /app
# Copy compiled binary and config
COPY --from=compressor /app/runner .
COPY .env.example .env
# Run the application
#CMD ["./runner"]
CMD ["/bin/sh"]
# Expose required ports
EXPOSE 8080/tcp
