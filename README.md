# pkms

软件包管理系统，旨在让交付环节变得简单高效。

## 技术栈

- **后端**：
    - Go 语言
    - [go-clean-architecture](https://github.com/amitshekhariitbhu/go-backend-clean-architecture)
    - Gin Web 框架
    - ent ORM（默认使用 SQLite，可扩展）
    - Casbin 权限控制
- **前端**：
    - React + TypeScript
    - Vite 构建工具
    - shadcn-ui 组件库
- **部署与运维**：
    - Docker 支持
    - docker-compose 多环境部署

## 主要功能

- 多租户支持
- 项目管理
- 软件包管理
- 发布版本管理
- 用户与权限组管理
- 支持 CICD 上传（CLI 或 CURL）
- 客户端接入与自动更新

## 目录结构

- `api/`         —— OpenAPI/接口定义
- `cmd/`         —— 程序入口
- `config/`      —— 配置文件（如 RBAC、环境变量等）
- `controller/`  —— 路由控制器
- `domain/`      —— 领域模型与业务逻辑
- `ent/`         —— ORM 相关代码
- `frontend/`    —— 前端源码（见 frontend/README.md）
- `internal/`    —— 内部工具与通用逻辑
- `logs/`        —— 日志文件
- `pkg/`         —— 可复用的包
- `repository/`  —— 数据访问层
- `script/`      —— 脚本工具
- `usecase/`     —— 用例/业务流程
- `docs/`        —— 项目文档

## 快速开始

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

默认访问地址为 `http://localhost:5173`，可通过 `vite.config.ts` 配置端口和代理。

### 后端启动

```bash
# 项目根目录
go mod tidy
# 首先编译前端资源(确保frontend/frontend.go embed dist/* 到二进制文件 )
# 运行
go run cmd/main.go
# 或者编译成二进制可执行文件
go build -o pkms cmd/main.go
```

### Docker 一键启动

```bash
docker-compose up -d
```

## Test 
```bash
# 运行测试
 go test ./...
```
## 相关文档

- 前端详细说明见 `frontend/README.md`。
- docs/ent.md 包含 ent ORM 的使用说明。
