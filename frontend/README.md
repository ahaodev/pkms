# pkms 前端（frontend）

本目录为 pkms 项目的前端部分,基于 React + TypeScript + Vite 构建，采用模块化结构，支持多租户、包管理、项目管理、权限控制等功能。

## 主要特性

- 现代化前端架构，使用 React + TypeScript + Vite + shadcn/ui + Tailwind CSS组件化开发
- 支持多租户、项目、包、版本的全流程管理
- 支持亮暗主题
- 支持国际化（i18n）
- 完善的权限与用户管理
- 支持 Docker 部署
- 支持Windows、Linux、macOS等多平台运行(前后端统一打包二进制可执行文件)

## 目录结构简介

- `src/components/`：通用 UI 组件与业务组件
- `src/config/`：配置路由
- `src/pages/`：页面级组件
- `src/hooks/`：自定义 hooks
- `src/contexts/`：全局上下文
- `src/lib/`：工具函数与 API 封装
- `src/types/`：类型定义
- `src/providers/`：全局 Provider
- `frontend.go`：通过该go文件编译前端资源到二进制文件中(提前编译前端资源)
- 其他配置文件（如 vite.config.ts、tailwind.config.js 等）

## 启动与构建

```bash
npm install
npm run dev      # 本地开发
npm run build    # 生产构建
```

本地开发默认访问地址为 `http://localhost:5173`,通过vite.config.ts配置端口和代理,解决跨域问题,访问后端的本地8080端口。

## 相关文档

- 详见项目根目录下的文档与源码注释
