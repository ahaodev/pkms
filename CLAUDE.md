# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PKMS (Package Management System) is a software package management system designed to simplify the delivery process. It's a full-stack application with a Go backend and React frontend that manages projects, software packages, users, and permissions using RBAC (Role-Based Access Control).

## Development Commands

### Backend (Go)
```bash
# Generate Ent database code (run after schema changes)
go generate ./ent

# Run development server (port 8080)
go run ./cmd/main.go

# Build production binary (requires frontend to be built first)
go build -o pkms ./cmd/main.go

# Install Ent CLI tool
go install entgo.io/ent/cmd/ent@latest
```

### Frontend (React + Vite)
```bash
cd ./frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
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
- **cmd/main.go**: Application entry point, starts Gin server on port 8080
- **bootstrap/**: Application initialization (database, env, casbin, minio)
- **api/**: HTTP layer with controllers, middleware, and routes
- **domain/**: Business entities and constants
- **usecase/**: Business logic layer
- **repository/**: Data access layer (Ent ORM)
- **ent/**: Database schema and generated code (Ent ORM with SQLite default)
- **internal/**: Internal packages (casbin, utilities)
- **pkg/**: Shared utilities (logging, file handling, time)

### Frontend Structure (React + TypeScript)
- **src/components/**: Reusable UI components organized by feature
- **src/pages/**: Page-level components
- **src/lib/api/**: API client and service layer
- **src/contexts/**: React contexts for state management
- **src/hooks/**: Custom React hooks
- **src/types/**: TypeScript type definitions
- **src/providers/**: Provider components for contexts

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

## Testing & Development

- Default admin user created on startup: admin/admin123
- Default test users: ahao/123, test/123
- Logs written to `logs/` directory with rotation
- SQLite database file: `data.db`