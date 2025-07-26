# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PKMS (Package Management System) is a software package management system designed to simplify the delivery process. It's
a full-stack application with a Go backend and React frontend that manages projects, software packages, users, and
permissions using RBAC (Role-Based Access Control).

## Development Commands

### Frontend (React + TypeScript + Vite + shadcn-ui + Tailwind CSS)

```bash
cd ./frontend

# Install dependencies
npm install

# Run development server (port 5173, proxies /api to localhost:8080)
npm run dev

# Build for production (includes TypeScript build check)
# The backend must be built after the frontend. The dist directory (frontend/dist) is packaged into the backend binary via frontend.go (frontend/frontend.go).
npm run build

# Lint code
npm run lint

# Check TypeScript types
npx tsc --noEmit

# Preview production build
npm run preview

# Security audit
npm audit

# Fix security vulnerabilities
npm audit fix
```


### Backend (Go Backend Clean Architecture)


```bash
# Generate Ent database code (run after schema changes)
go generate ./ent

# Run development server (port 8080)
go run ./cmd/main.go

# Build production binary (requires frontend to be built first)
go build -o pkms ./cmd/main.go

# Run tests
go test ./...

# Install Ent CLI tool
go install entgo.io/ent/cmd/ent@latest
```


### Docker & Release

```bash
# Build Docker image
docker build -t hao88/pkms:latest .

# Push to Docker Hub
docker push hao88/pkms:latest

# Install GoReleaser
go install github.com/goreleaser/goreleaser@latest

# Test release build locally
goreleaser release --snapshot --clean

# Production release (requires GITHUB_TOKEN and DOCKER_USERNAME env vars)
goreleaser release --clean
```

## Architecture

### Backend Structure (Go Clean Architecture)

- **Router**: Router（路由层） 负责 API 路由注册和分发
- Controller（控制器层） 处理 HTTP 请求、参数校验、调用具体业务逻辑。
- Usecase（用例层） 处理具体业务逻辑，调用 Repository 层进行数据访问。
- Repository（数据访问层） 负责与数据库交互，使用 Ent ORM 进行数据操作。
- Ent（实体层） 定义数据模型和数据库 schema，使用 Ent ORM 生成代码。
- Internal（内部包） 提供 Casbin 权限控制、日志、文件处理等工具函数。
- 目录结构示例

```
├── api
│   ├── controller          # 控制器
│   ├── middleware          # JWT 中间件
│   └── route               # 路由
├── bootstrap               # 项目初始化、环境配置
├── cmd/main.go             # 项目入口
├── domain                  # 领域模型
├── internal/               # Token 工具
├── mongo                   # MongoDB 相关实现
├── repository              # 数据仓库
└── usecase                 # 用例/业务逻辑
```

- **cmd/main.go**: Application entry point, starts Gin server on port 8080
- **bootstrap/**: Application initialization (database, env, casbin, minio)
- **api/**: HTTP layer with controllers, middleware, and routes
- **domain/**: Business entities and constants
- **usecase/**: Business logic layer
- **repository/**: Data access layer (Ent ORM)
- **ent/**: Database schema and generated code (Ent ORM with SQLite default)
- **internal/**: Internal packages (casbin, utilities)
- **pkg/**: Shared utilities (logging, file handling, time)

### Frontend Structure (React + TypeScript + Vite + shadcn-ui + Tailwind CSS)

- **src/components/**: Reusable UI components organized by feature
    - **ui/**: Shadcn/UI components (buttons, forms, dialogs, etc.)
    - **auth/**: Authentication-related components (login forms, auth layout)
    - **dashboard/**: Dashboard-specific components (stats, recent items)
    - **project/**, **user/**, **settings/**: Feature-specific component groups
- **src/pages/**: Page-level components for each route
- **src/lib/api/**: API client and service layer with axios interceptors
- **src/providers/**: Provider components for contexts (auth, theme, query client)
- **src/hooks/**: Custom React hooks for data fetching and state management
- **src/types/**: TypeScript type definitions for API responses and domain models
- **src/config/**: Configuration files (routes, API endpoints)

### Frontend Architecture Patterns

**State Management**:

- TanStack Query for server state with aggressive cache invalidation
- React Context for global UI state (auth, theme)
- Local component state for UI interactions

**Authentication Flow**:

- JWT tokens stored in localStorage (ACCESS_TOKEN, REFRESH_TOKEN)
- Multi-tenant support with tenant switching via x-tenant-id header
- Route guards based on authentication status and admin roles
- Automatic token refresh and 401 error handling

**Routing System**:

- Centralized route configuration in `src/config/routes.ts`
- Role-based route protection (public, authenticated, admin-only)
- Dynamic route rendering based on auth status

**API Integration**:

- Axios client with automatic JWT token injection
- Request/response interceptors for authentication and error handling
- Dynamic base URL resolution for different environments
- Development proxy: `/api/*` → `http://localhost:8080`

### Key Technologies

- **Backend**: Gin (HTTP), Ent (ORM), Casbin (RBAC), MinIO (file storage), JWT auth
- **Frontend**: Vite, React, TypeScript, Shadcn/UI, TanStack Query, React Router
- **Database**: SQLite (default), supports MySQL and PostgreSQL
- **Auth**: JWT-based authentication with refresh tokens

## RBAC Permission System

The system uses Casbin with domain-based RBAC:

- **Model**: Located in `config/rbac_model.conf`
- **Domains**: Multi-tenant support with domain isolation
- **Roles**: admin, USER, PM (defined in `domain/constants.go`)
- **Resources**: project, package, user, file
- **Actions**: read, write, delete

### Permission Middleware

Routes are protected using `middleware.CasbinMiddleware`:

- `RequirePermission(resource, action)`: Check specific permissions
- `RequireRole(role)`: Check role membership
- Profile and dashboard routes allow all authenticated users

### Current RBAC Implementation
The system currently has extensive permission configurations in place:
- Domain-specific permissions for tenants (`d208s9frlmvmbf5ketk0`, `d208s9frlmvmbf5ketl0`, `d208s9frlmvmbf5ketm0`)
- Role-based access for admin, pm (project manager), and user roles
- Granular resource permissions covering projects, packages, releases, files, and users
- Action-level control: read, write, delete, create, update, list, share, upload, download

## Database Schema (Ent)

Key entities defined in `ent/schema/`:

- **User**: User accounts with authentication
- **Project**: Software projects
- **Packages**: Software packages belonging to projects
- **Release**: Package versions/releases
- **Share**: Sharing permissions
- **Tenant**: Multi-tenancy support
- **CasbinRule**: RBAC policy storage

## File Storage

Uses MinIO (S3-compatible) for file storage:

- Configuration via environment variables (S3_ADDRESS, S3_ACCESS_KEY, etc.)
- File operations in `repository/minio_file_repository.go`
- Upload/download through `api/controller/file_controller.go`

## Environment Configuration

Application configuration loaded via Viper from:

- Environment variables
- Configuration files
- Default values in `bootstrap/env.go`

Key environment variables:

- Database connection settings
- JWT secrets (ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET)
- MinIO/S3 credentials
- Server timeouts and ports

## Frontend Development Patterns

### Component Organization

- **Feature-based grouping**: Components are organized by domain (auth, dashboard, project, user)
- **UI Components**: Shadcn/UI components in `src/components/ui/` with consistent styling
- **Index exports**: Each component group has an `index.ts` for clean imports
- **TypeScript**: Strict typing with interfaces for props and API responses

### API Client Architecture

- **Base client**: `apiClient` in `src/lib/api/api.ts` with interceptors
- **Service layer**: Separate files for each domain (auth.ts, projects.ts, users.ts)
- **Error handling**: Global 401 handling with automatic logout/redirect
- **Multi-tenancy**: Automatic tenant ID injection via `x-tenant-id` header

### Authentication System

- **AuthProvider**: Centralized auth state in `src/providers/auth-provider.tsx`
- **Route protection**: `RouteGuard` component for role-based access
- **Token management**: Automatic refresh token handling
- **Tenant switching**: Support for multi-tenant environments

### Styling and Theming

- **Tailwind CSS**: Utility-first styling with custom configuration
- **Theme system**: Dark/light mode support via `next-themes`
- **Component variants**: `class-variance-authority` for component styling patterns
- **Responsive design**: Mobile-first approach with responsive utilities

### State Management Strategy

- **Server state**: TanStack Query with minimal caching (always fresh data)
- **Client state**: React Context for auth, theme, and global UI state
- **Form state**: React Hook Form with Zod validation
- **URL state**: React Router for navigation and route parameters

## Development Workflow

### Full-Stack Development Setup
```bash
# Terminal 1: Start backend (must be first)
go run ./cmd/main.go

# Terminal 2: Start frontend development server
cd frontend && npm run dev
```

### After Schema Changes
```bash
# Always regenerate Ent code after modifying ent/schema files
go generate ./ent

# Restart backend to apply schema changes
go run ./cmd/main.go
```

### Before Committing Code
```bash
# Backend checks
go test ./...
go mod tidy

# Frontend checks
cd frontend
npm run lint
npm run build
npm audit
```

### Branch Management
- Current branch: `rbac-domains` (RBAC optimization work)
- Main branch for PRs: `main`
- Recent commits focus on permission system optimization

## Testing & Development

- Default admin user created on startup: admin/admin123
- Default test users: ahao/123, test/123
- Logs written to `logs/` directory with rotation
- SQLite database file: `data.db`
- Frontend development server runs on port 5173 with API proxy to port 8080

## Common Issues & Troubleshooting

### Backend Issues
- **"Failed to generate Ent code"**: Run `go install entgo.io/ent/cmd/ent@latest` first
- **Database migration errors**: Delete `data.db` and restart backend for clean database
- **Port 8080 already in use**: Kill existing Go processes or change port in `bootstrap/env.go`

### Frontend Issues
- **CORS errors**: Ensure backend is running on port 8080 before starting frontend
- **Node module errors**: Delete `node_modules/` and `package-lock.json`, then `npm install`
- **Build failures**: Run `npx tsc --noEmit` to check TypeScript errors first
- **Performance warnings**: Bundle is currently oversized (628KB), needs code splitting

### Permission System Issues
- **403 Forbidden**: Check user role assignments and Casbin policies in database
- **Authentication failures**: Verify JWT tokens in localStorage and backend configuration
- **Multi-tenant access**: Ensure `x-tenant-id` header is set correctly in requests

# important-instruction-reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly
requested by the User.

## Permissions and Role Management

### Casbin Policy Details
- **Row Format**: `[type],[id],[role/domain],[resource],[action]`
- Policy Entries Added:
  - System-wide role-based permissions for admin, pm, and user roles
  - Specific domain permissions for `d208s9frlmvmbf5ketk0`, `d208s9frlmvmbf5ketl0`, and `d208s9frlmvmbf5ketm0`
  - Covers actions like read, write, delete, create, update, list, and share
  - Sidebar access permissions for dashboard, projects, and upgrade
  - Granular permissions for projects, packages, releases, files, and users

### Casbin Rule Details for this System
- Added Casbin rules covering complex permission mappings:
  - Specific domain-level access rules
  - Role-based permission sets for admin, pm, and user roles
  - Granular permissions across various resources and actions
```

</invoke>