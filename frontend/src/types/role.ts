// 原有的UserRole类型保留
export type UserRole = 'admin' | 'user';

// 新增的Role管理类型定义

export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  tenant_id?: string;
  is_system: boolean;
  is_active: boolean;
  users?: any[]; // 使用any避免循环引用
  created_at: string;
  updated_at: string;
}

export interface CreateRoleRequest {
  name: string;
  code: string;
  description?: string;
  tenant_id: string; // 必须绑定租户
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface AssignRoleRequest {
  user_ids: string[];
}

export interface RolePermission {
  role_id: string;
  menu_id: string;
  permission_key: string;
  resource: string;
  action: string;
}

