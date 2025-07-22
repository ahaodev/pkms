# MinIO 迁移到本机磁盘存储指南

## 概述

本文档提供了将 PKMS 系统从 MinIO 对象存储迁移到本地磁盘文件存储的完整指南。

## 当前架构分析

### MinIO 相关组件

1. **存储接口层** (`domain/file.go`)
   - `FileRepository` 接口定义了存储操作
   - `FileUsecase` 定义业务逻辑接口

2. **MinIO 实现** (`repository/minio_file_repository.go`)
   - 实现了 `FileRepository` 接口
   - 提供 Upload, Download, Delete, List, GetObjectStat 方法

3. **应用初始化** (`bootstrap/app.go`)
   - MinIO 客户端初始化
   - 连接配置管理

4. **路由层** (`api/route/`)
   - `file_route.go`: 文件管理路由
   - `package_route.go`: 包管理路由
   - `route.go`: 主路由配置

5. **前端组件**
   - `frontend/src/components/settings/storage-settings.tsx`

## 迁移实施计划

### 第一阶段：创建本地磁盘存储实现

#### 1. 创建本地文件存储 Repository

**文件**: `repository/disk_file_repository.go`

```go
package repository

import (
    "context"
    "io"
    "os"
    "path/filepath"
    "time"
    "fmt"
    
    "pkms/domain"
    "pkms/pkg"
)

type diskFileRepository struct {
    basePath string
}

func NewDiskFileRepository(basePath string) domain.FileRepository {
    return &diskFileRepository{
        basePath: basePath,
    }
}

// 实现所有接口方法...
```

**实现要点：**
- 将 bucket 概念映射为根目录下的子目录
- 维护与 MinIO 相同的接口签名
- 处理文件权限和目录创建
- 实现文件锁定机制防止并发冲突

#### 2. 环境配置扩展

**文件**: `bootstrap/env.go`

```go
// 添加新的配置项
type Env struct {
    // 现有配置...
    
    // 存储类型配置
    StorageType     string `mapstructure:"STORAGE_TYPE"`      // "minio" 或 "disk"
    DiskStoragePath string `mapstructure:"DISK_STORAGE_PATH"` // 本地存储路径
    
    // MinIO 配置保留，用于向后兼容
    S3Address   string `mapstructure:"S3_ADDRESS"`
    S3AccessKey string `mapstructure:"S3_ACCESS_KEY"`
    // ...
}
```

#### 3. 应用初始化修改

**文件**: `bootstrap/app.go`

```go
type Application struct {
    Env           *Env
    DB            *ent.Client
    FileStorage   domain.FileRepository  // 改为通用接口
    CasbinManager *casbin.CasbinManager
}

func App() Application {
    app := &Application{}
    app.Env = NewEnv()
    app.DB = NewEntDatabase(app.Env)
    app.CasbinManager = casbin.NewCasbinManager(app.DB)
    
    // 根据配置选择存储类型
    switch app.Env.StorageType {
    case "disk":
        app.FileStorage = repository.NewDiskFileRepository(app.Env.DiskStoragePath)
    case "minio":
        fallthrough
    default:
        app.FileStorage = repository.NewFileRepository(initMinioClient(app.Env))
    }
    
    return *app
}
```

### 第二阶段：更新路由和控制器

#### 1. 路由参数调整

**文件**: `api/route/file_route.go`, `api/route/package_route.go`

```go
// 将 *minio.Client 参数改为 domain.FileRepository
func NewFileRouter(env *bootstrap.Env, timeout time.Duration, db *ent.Client, fileRepo domain.FileRepository, group *gin.RouterGroup) {
    fc := &controller.FileController{
        FileUsecase: usecase.NewFileUsecase(fileRepo, timeout),
        Env:         env,
    }
    // ...
}
```

#### 2. 主路由修改

**文件**: `api/route/route.go`

```go
func Setup(env *bootstrap.Env, timeout time.Duration, db *ent.Client, casbinManager *casbin.CasbinManager, fileStorage domain.FileRepository, gin *gin.Engine) {
    // 更新所有路由调用，传递 fileStorage 而不是 minioClient
    NewFileRouter(env, timeout, db, fileStorage, fileRouter)
    NewPackageRouter(env, timeout, db, fileStorage, packageRouter)
}
```

#### 3. 主程序入口修改

**文件**: `cmd/main.go`

```go
func main() {
    // ...
    app := bootstrap.App()
    defer app.CloseDBConnection()

    route.Setup(env, timeout, db, casbin, app.FileStorage, apiEngine)  // 使用 FileStorage
    // ...
}
```

### 第三阶段：数据迁移

#### 1. 创建迁移工具

**文件**: `cmd/migrate/main.go`

```go
package main

import (
    "context"
    "fmt"
    "io"
    "log"
    
    "pkms/bootstrap"
    "pkms/repository"
)

func main() {
    env := bootstrap.NewEnv()
    
    // 初始化源存储 (MinIO)
    sourceRepo := repository.NewFileRepository(initMinioClient(env))
    
    // 初始化目标存储 (Disk)
    targetRepo := repository.NewDiskFileRepository(env.DiskStoragePath)
    
    // 执行迁移
    if err := migrateFiles(sourceRepo, targetRepo); err != nil {
        log.Fatal("Migration failed:", err)
    }
}
```

#### 2. 迁移脚本

```bash
#!/bin/bash
# migrate.sh

echo "Starting PKMS storage migration..."

# 1. 停止应用服务
docker-compose down

# 2. 备份当前数据
mkdir -p backup/$(date +%Y%m%d_%H%M%S)

# 3. 运行迁移工具
go run cmd/migrate/main.go

# 4. 更新环境配置
sed -i 's/STORAGE_TYPE=minio/STORAGE_TYPE=disk/' .env

# 5. 启动应用
docker-compose up -d

echo "Migration completed!"
```

### 第四阶段：配置和部署

#### 1. Docker 配置调整

**文件**: `Dockerfile`

```dockerfile
# 添加本地存储目录
RUN mkdir -p /app/storage

# 在 runtime stage 中设置权限
RUN chown -R app:app /app/storage
```

**文件**: `docker-compose.yaml`

```yaml
services:
  app:
    volumes:
      - ./storage:/app/storage  # 本地存储挂载
      - ./data:/app/data
      - ./logs:/app/logs
    environment:
      - STORAGE_TYPE=disk
      - DISK_STORAGE_PATH=/app/storage
```

#### 2. 环境变量配置

**文件**: `.env.example`

```bash
# Storage Configuration
STORAGE_TYPE=disk                    # minio | disk
DISK_STORAGE_PATH=./storage         # 本地存储路径

# MinIO Configuration (keep for backward compatibility)
S3_ADDRESS=localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_TOKEN=
S3_BUCKET_NAME=pkms
S3_USE_SSL=false
```

### 第五阶段：前端适配

#### 1. 更新存储设置组件

**文件**: `frontend/src/components/settings/storage-settings.tsx`

```tsx
// 添加存储类型选择
const StorageSettings = () => {
  const [storageType, setStorageType] = useState<'minio' | 'disk'>('disk');
  
  return (
    <div>
      <Label>存储类型</Label>
      <Select value={storageType} onValueChange={setStorageType}>
        <SelectItem value="disk">本地磁盘</SelectItem>
        <SelectItem value="minio">MinIO 对象存储</SelectItem>
      </Select>
      
      {storageType === 'disk' && (
        <Input placeholder="存储路径" />
      )}
      
      {storageType === 'minio' && (
        // MinIO 配置表单
      )}
    </div>
  );
};
```

## 实施检查清单

### 开发阶段
- [ ] 实现 `DiskFileRepository`
- [ ] 更新环境配置结构
- [ ] 修改应用初始化逻辑
- [ ] 更新所有路由和控制器
- [ ] 创建迁移工具
- [ ] 编写单元测试

### 测试阶段
- [ ] 本地存储功能测试
- [ ] 文件上传/下载测试
- [ ] 并发操作测试
- [ ] 权限控制测试
- [ ] 迁移工具测试

### 部署阶段
- [ ] 更新 Docker 配置
- [ ] 准备迁移脚本
- [ ] 备份现有数据
- [ ] 执行迁移
- [ ] 验证数据完整性
- [ ] 更新文档

## 风险评估与回滚方案

### 主要风险
1. **数据丢失风险**: 迁移过程中的数据丢失
2. **性能影响**: 本地存储的 I/O 性能
3. **并发冲突**: 多进程访问同一文件
4. **存储空间**: 本地磁盘空间限制

### 回滚方案
1. 保留 MinIO 配置选项
2. 实施过程中保持数据双写
3. 准备快速切换脚本
4. 监控系统健康状态

## 性能优化建议

1. **文件缓存**: 实现本地文件缓存机制
2. **分层存储**: 热数据本地，冷数据远程
3. **压缩存储**: 对大文件进行压缩存储
4. **清理策略**: 定期清理临时文件和过期数据

## 维护和监控

1. **存储空间监控**: 监控磁盘使用率
2. **文件完整性检查**: 定期校验文件完整性
3. **访问日志**: 记录文件访问日志
4. **备份策略**: 制定定期备份计划

## 总结

这个迁移方案采用了渐进式的方法，通过接口抽象保持了系统的灵活性。关键是要确保在迁移过程中的数据安全和系统稳定性。建议在生产环境实施前，先在测试环境中完整验证整个迁移流程。