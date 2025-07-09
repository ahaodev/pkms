# pkms

软件包管理系统,旨在让交付环节变得简单

## 功能

- 项目管理
- 软件包管理
- 多用户和权限组
- CICD上传到该系统(CLI或者CURL晚些构建)
- 客户端接入更新

## 后端

- [go-clean-architecture](https://github.com/amitshekhariitbhu/go-backend-clean-architecture)
- ent sqlite (默认)
- gin

## 前端

- vite + react + shadcn-ui

## 跑起来

### 前端

```bash

cd ./frontend

npm install 

npm run dev 

``` 

### GO的后端

根据ent目录定义的schema,生成数据库相关代码
```bash
go install entgo.io/ent/cmd/ent@latest
```
> 可在ent/generate.go文件中点击generate file生成

```bash
# 运行
go run ./cmd/main.go
# 编译(先编译前端 npm run build)
go build -o pkms ./cmd/main.go
```

### goreleaser

安装

```shell
go install github.com/goreleaser/goreleaser@latest
```

生成配置

```shell
goreleaser init
```

本地测试打包

```shell
goreleaser release --snapshot --clean
```

正式发布并推送到github releases

```shell
# 设置token(windows) 
$env:GITHUB_TOKEN="token_here"

goreleaser release --clean
```