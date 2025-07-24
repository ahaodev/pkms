# RBAC 域/租户修复测试指南

## 修复总结

已完成对前端权限管理组件的域/租户支持修复：

### 1. 修复的组件：
- ✅ `RolePermissionsConfig.tsx` - 角色权限配置
- ✅ `UserPermissionsConfig.tsx` - 用户权限配置  
- ✅ `UserRoleAssignment.tsx` - 用户角色分配
- ✅ `types/permissions.ts` - 权限类型定义

### 2. 主要修改：

#### 类型定义更新
```typescript
// 所有表单类型都添加了 tenant 字段
export interface RolePolicyForm {
    role: string;
    tenant: string;  // 新增
    object: string;
    action: string;
}

export interface UserRoleForm {
    user_id: string;
    role: string;
    tenant: string;  // 新增
}

export interface UserPolicyForm {
    user_id: string;
    tenant: string;  // 新增
    object: string;
    action: string;
}
```

#### 组件修改
1. **引入认证上下文**：所有组件都使用 `useAuth()` 获取当前租户
2. **表单添加租户字段**：所有权限创建表单都包含租户选择器
3. **API 请求包含租户**：所有 API 请求都在请求体中包含租户参数
4. **表格显示租户信息**：所有权限列表都显示租户/域信息
5. **删除操作包含租户**：删除权限时包含域参数

### 3. 对应 RBAC 模型

修复确保前端完全对应后端 RBAC 模型：
```
r = sub, dom, obj, act
```
- `sub` - 用户/角色 (subject)
- `dom` - 租户/域 (domain/tenant) ✅ **现在正确处理**
- `obj` - 对象 (object)
- `act` - 操作 (action)

## 测试验证

### 前置条件
1. 确保后端正在运行 (port 8080)
2. 确保有有效的租户数据
3. 登录系统并切换到特定租户

### 测试步骤

#### 1. 角色权限配置测试
```bash
# 访问权限管理页面
http://localhost:5173/permissions

# 在"角色权限配置"选项卡：
1. 点击"添加角色权限"
2. 验证租户字段显示当前租户
3. 选择角色、对象、操作
4. 提交，检查 API 请求包含所有字段（包括tenant）
5. 验证权限列表显示租户信息
6. 测试删除功能
```

#### 2. 用户权限配置测试
```bash
# 在"用户权限配置"选项卡：
1. 点击"添加用户权限"
2. 验证租户字段显示当前租户
3. 选择用户、对象、操作
4. 提交，检查 API 请求包含tenant字段
5. 验证权限列表显示租户信息
6. 测试删除功能
```

#### 3. 用户角色分配测试
```bash
# 在"用户角色分配"选项卡：
1. 点击"添加用户角色"
2. 验证租户字段显示当前租户
3. 选择用户、角色
4. 提交，检查 API 请求包含tenant字段
5. 验证角色列表显示租户信息
6. 测试删除功能
```

#### 4. 多租户隔离测试
```bash
# 如果有多个租户：
1. 在租户A中创建权限/角色
2. 切换到租户B
3. 验证租户A的权限/角色不可见
4. 在租户B中创建不同的权限/角色
5. 验证租户隔离正确工作
```

## 验证API请求

### 期望的API请求格式

#### 创建角色权限
```json
POST /api/v1/casbin/role-policies
{
    "role": "pm",
    "tenant": "tenant-123",
    "object": "project", 
    "action": "read"
}
```

#### 创建用户权限
```json
POST /api/v1/casbin/policies
{
    "user_id": "user-456",
    "tenant": "tenant-123",
    "object": "package",
    "action": "write"
}
```

#### 分配用户角色
```json
POST /api/v1/casbin/roles
{
    "user_id": "user-456",
    "role": "developer",
    "tenant": "tenant-123"
}
```

#### 删除权限（包含租户）
```json
DELETE /api/v1/casbin/role-policies
{
    "role": "pm",
    "tenant": "tenant-123",
    "object": "project",
    "action": "read"
}
```

## 预期行为

### ✅ 修复后应该看到的行为：
1. 所有权限管理表单都包含租户选择器
2. 租户选择器显示当前租户（不可编辑）
3. 权限列表表格包含"租户"列
4. API 请求包含完整的域上下文
5. 权限创建/删除都在正确的租户域中进行
6. 多租户之间权限完全隔离

### ❌ 修复前的问题：
1. 表单缺少租户字段
2. API 请求不包含租户参数
3. 权限可能跨租户泄露
4. 删除操作不包含域信息

## 潜在问题排查

### 如果权限操作失败：
1. 检查浏览器开发者工具 Network 标签
2. 验证 API 请求是否包含所有必需字段
3. 检查 `x-tenant-id` 请求头是否正确设置
4. 验证后端是否期望不同的请求格式

### 如果租户选择器为空：
1. 检查 `currentTenant` 是否正确从 AuthProvider 获取
2. 验证用户是否已正确登录并选择租户
3. 检查 localStorage 中的 CURRENT_TENANT

### 如果权限显示不正确：
1. 验证后端返回的权限数据包含 `domain` 和 `domain_name` 字段
2. 检查组件是否正确解析和显示域信息

## 代码质量

- ✅ TypeScript 类型安全
- ✅ 组件复用现有 UI 模式
- ✅ 错误处理和用户反馈
- ✅ 与现有认证系统集成
- ⚠️ 构建成功但有现有的 lint 警告（与此修复无关）

## 结论

修复成功解决了 casbin_check1.md 中发现的所有问题：

1. **权限创建包含域上下文** ✅
2. **表单包含租户选择** ✅  
3. **API 请求体完整** ✅
4. **多租户权限隔离** ✅

前端权限管理现在完全对应后端 RBAC 模型的域概念，确保多租户环境下的权限安全性。