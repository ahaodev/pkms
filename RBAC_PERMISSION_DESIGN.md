# PKMS 简化权限体系设计

## 权限模式
使用标准 RBAC 模式（3参数：subject, object, action）实现项目级权限控制

## 动作（Action）设计

### 简化的三种动作
- `view` - 查看权限（只读访问）
- `edit` - 编辑权限（包含查看、创建、修改、删除所有写操作）
- `*` - 超级权限（所有操作，通常用于管理员角色）

## 对象（Object）设计

### 1. 系统管理级别
- `system` - 系统设置、配置管理
- `user` - 用户管理
- `permission` - 权限管理
- `dashboard` - 仪表板访问
- `project` - 项目管理（全局项目管理权限）

### 2. 项目级别（支持项目隔离）
- `project:PROJECT_ID` - 特定项目本身的管理
- `project:PROJECT_ID:package` - 特定项目的包管理

## 侧边栏显示逻辑

根据权限自动显示对应的侧边栏项目：
- 有 `dashboard` 权限 → 显示"仪表板"
- 有 `project` 或任何 `project:*` 权限 → 显示"项目"
- 有任何 `project:*:package` 权限 → 显示"包管理"
- 有 `user` 权限 → 显示"用户管理"
- 有 `permission` 权限 → 显示"权限管理"
- 有 `system` 权限 → 显示"系统设置"

## 权限示例

### 系统管理员（admin）
```
admin, *, *
```

### 项目管理员（project_manager）
针对特定项目的管理权限：
```
project_manager, project:d1qcem8rvcua2g9ugv70, *
project_manager, project:d1qcem8rvcua2g9ugv70:package, *
project_manager, dashboard, view
```

### 开发者（developer）
针对特定项目的编辑权限：
```
developer, project:d1qcem8rvcua2g9ugv70, view
developer, project:d1qcem8rvcua2g9ugv70:package, edit
developer, dashboard, view
```

### 查看者（viewer）
针对特定项目的只读权限：
```
viewer, project:d1qcem8rvcua2g9ugv70, view
viewer, project:d1qcem8rvcua2g9ugv70:package, view
viewer, dashboard, view
```

## 权限检查示例

### 后端代码中的权限检查
```go
// 检查用户是否可以查看特定项目的包
result := casbinManager.CheckPermission(userID, fmt.Sprintf("project:%s:package", projectID), "view")

// 检查用户是否可以编辑特定项目的包（包含创建、修改、删除）
result := casbinManager.CheckPermission(userID, fmt.Sprintf("project:%s:package", projectID), "edit")

// 检查用户是否有系统管理权限
result := casbinManager.CheckPermission(userID, "system", "edit")

// 检查用户是否可以访问仪表板
result := casbinManager.CheckPermission(userID, "dashboard", "view")
```

### 前端权限控制逻辑
```javascript
// 侧边栏显示逻辑
const showDashboard = hasPermission("dashboard", "view");
const showProjects = hasPermission("project", "view") || hasAnyProjectPermission();
const showPackages = hasAnyProjectPackagePermission();
const showUsers = hasPermission("user", "view");
const showPermissions = hasPermission("permission", "view");
const showSettings = hasPermission("system", "view");

// 功能按钮控制
const canCreatePackage = hasPermission(`project:${projectId}:package`, "edit");
const canDeletePackage = hasPermission(`project:${projectId}:package`, "edit");
const canViewPackage = hasPermission(`project:${projectId}:package`, "view");
```

## 权限等级说明

### edit 权限包含的操作
- 查看（view）
- 创建（create）
- 修改（update）  
- 删除（delete）
- 执行（execute）

### 权限继承规则
1. `*` 权限包含所有操作
2. `edit` 权限包含 `view` 权限
3. 角色权限通过用户-角色关系继承

## 优势

1. **简洁明了**：只有三种动作，易于理解和管理
2. **项目隔离**：通过 `project:PROJECT_ID:resource` 格式实现项目级权限控制
3. **灵活控制**：edit 权限涵盖所有写操作，减少权限碎片化
4. **自动侧边栏**：根据权限自动显示相应的菜单项
5. **易于扩展**：可以轻松添加新的资源类型

## 实现建议

1. **中间件权限检查**：统一的权限验证中间件
2. **前端权限指令**：Vue/React 指令自动控制组件显示
3. **API 级别控制**：每个 API 端点都要验证相应权限
4. **权限缓存**：缓存用户权限信息，提高性能 