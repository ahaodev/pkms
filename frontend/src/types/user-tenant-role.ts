// 租户角色分配
export interface TenantRoleAssignment {
  tenant_id: string;
  role_id: string;
}

// 用户租户角色关联
export interface UserTenantRole {
  id: string;
  user_id: string;
  tenant_id: string;
  role_id: string;
  created_at: string;
  updated_at: string;
  // 关联信息
  user_name?: string;
  tenant_name?: string;
  role_name?: string;
  role_code?: string;
}

// 分配用户租户角色请求
export interface AssignUserTenantRoleRequest {
  user_id: string;
  tenant_roles: TenantRoleAssignment[];
}

// 移除用户租户角色请求
export interface RemoveUserTenantRoleRequest {
  user_id: string;
  tenant_id: string;
  role_id: string;
}

// 用户在租户中的角色信息
export interface UserRoleInTenant {
  tenant_id: string;
  tenant_name: string;
  roles: {
    id: string;
    name: string;
    code: string;
    description?: string;
  }[];
}

// 租户角色下的用户信息
export interface UsersInTenantRole {
  tenant_id: string;
  tenant_name: string;
  role_id: string;
  role_name: string;
  users: {
    id: string;
    name: string;
    is_active: boolean;
  }[];
}

// 用户多租户角色概览
export interface UserTenantRoleOverview {
  user_id: string;
  user_name: string;
  tenant_roles: {
    tenant_id: string;
    tenant_name: string;
    role_id: string;
    role_name: string;
    role_code: string;
    assigned_at: string;
  }[];
}