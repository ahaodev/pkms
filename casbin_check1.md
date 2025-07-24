# Casbin RBAC Domain/Tenant 检查报告

## 检查概述

本报告检查了 PKMS 系统中前端"权限管理"页面是否正确对应了 `rbac_model.conf` 中定义的域(Domain/Tenant)概念。

## RBAC 模型定义

### rbac_model.conf 分析
```
[request_definition]
r = sub, dom, obj, act

[policy_definition]  
p = sub, dom, obj, act

[role_definition]
g = _, _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub, r.dom) && (p.dom == "*" || r.dom == p.dom) && (p.obj == "*" || r.obj == p.obj) && (p.act == "*" || r.act == p.act)
```

**关键发现**：
- `r = sub, dom, obj, act` 明确定义了请求格式包含域(Domain)
- `dom` 参数代表租户/域，用于多租户隔离
- 匹配器确保域级别的权限隔离：`(p.dom == "*" || r.dom == p.dom)`

## 前端权限管理页面检查

### 1. permissions.tsx 主页面
**位置**：`frontend/src/pages/permissions.tsx`

**正常功能**：
- ✅ 使用 apiClient 发送请求，自动添加 `x-tenant-id` 头
- ✅ 显示增强策略和角色时包含域信息
- ✅ 从后端正确获取数据

**缺少的功能**：
- ❌ API 调用中未明确处理租户上下文

### 2. 关键组件分析

#### RolePermissionsConfig 组件
**位置**：`frontend/src/components/permissions/RolePermissionsConfig.tsx`

**问题**：
- ❌ API 请求 `/api/v1/casbin/role-policies` 缺少租户参数
- ❌ 表单提交只发送 `{role, object, action}`，缺少 `tenant`
- ❌ 对话框中没有租户选择器

#### UserPermissionsConfig 组件  
**位置**：`frontend/src/components/permissions/UserPermissionsConfig.tsx`

**问题**：
- ❌ API 请求 `/api/v1/casbin/policies` 缺少租户参数
- ❌ 表单提交只发送 `{user_id, object, action}`，缺少 `tenant`
- ❌ 对话框中没有租户选择器

#### UserRoleAssignment 组件
**位置**：`frontend/src/components/permissions/UserRoleAssignment.tsx`  

**问题**：
- ❌ API 请求 `/api/v1/casbin/roles` 缺少租户参数
- ❌ 表单提交只发送 `{user_id, role}`，缺少 `tenant`
- ❌ 对话框中没有租户选择器

### 3. 类型定义检查

**位置**：`frontend/src/types/permissions.ts`

**正常**：
- ✅ `EnhancedPolicy` 类型包含 `domain` 和 `domain_name`
- ✅ `EnhancedRole` 类型包含 `domain` 和 `domain_name`

**问题**：
- ❌ 表单类型 `RolePolicyForm`、`UserRoleForm`、`UserPolicyForm` 缺少租户字段

## 基础设施检查

### API 客户端
**位置**：`frontend/src/lib/api/api.ts`
- ✅ 正确添加 `x-tenant-id` 请求头
- ✅ 自动从 localStorage 获取当前租户

### 认证提供者
**位置**：`frontend/src/providers/auth-provider.tsx`
- ✅ 管理当前租户状态
- ✅ 租户信息存储在 localStorage

## 问题总结

### 🚨 严重问题

1. **权限创建缺少域上下文**
   - 角色权限、用户权限、角色分配都未包含租户参数
   - 可能导致权限跨租户泄露

2. **表单缺少租户选择**
   - 所有权限管理表单都缺少租户/域选择器
   - 用户无法明确指定权限的域范围

3. **API 请求体不完整**
   - 虽然 HTTP 头包含租户信息，但请求体仍需租户参数
   - 后端 API 可能期望请求体中包含完整的域信息

### 🔧 需要修复的文件

1. `frontend/src/components/permissions/RolePermissionsConfig.tsx`
2. `frontend/src/components/permissions/UserPermissionsConfig.tsx`  
3. `frontend/src/components/permissions/UserRoleAssignment.tsx`
4. `frontend/src/types/permissions.ts` (表单类型)

### 📋 修复建议

1. **表单添加租户字段**
   ```typescript
   interface RolePolicyForm {
     role: string;
     tenant: string;  // 添加
     object: string;
     action: string;
   }
   ```

2. **API 请求包含租户**
   ```typescript
   const response = await apiClient.post('/api/v1/casbin/role-policies', {
     role: formData.role,
     tenant: currentTenant,  // 添加
     object: formData.object,
     action: formData.action
   });
   ```

3. **添加租户选择器**
   - 在权限管理对话框中添加租户下拉选择
   - 显示当前租户上下文

## 结论

前端权限管理页面与 RBAC 模型中的域(Domain/Tenant)概念**不完全对应**。虽然基础设施支持多租户，但权限管理表单缺少明确的租户上下文处理，可能导致权限配置在多租户环境下出现问题。

**严重程度**：🔴 高 - 影响多租户权限隔离安全性

**建议优先级**：立即修复

---
*检查时间：2025-07-24*
*检查范围：前端权限管理模块与 RBAC 域模型对应性*