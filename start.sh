#!/bin/bash

echo "启动 PKMS 项目..."

# 1. 生成 ENT Schema
echo "生成 ENT Schema..."
cd ent
go run -mod=mod entgo.io/ent/cmd/ent generate ./schema
cd ..

# 2. 构建前端
echo "构建前端..."
cd frontend
npm install
npm run build
cd ..

# 3. 启动后端
echo "启动后端服务..."
go mod tidy
go run cmd/main.go 