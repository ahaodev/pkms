import {GroupPermission} from "@/types/group.ts";
import {TenantRoleAssignment} from "@/types/user-tenant-role.ts";

export type UserRole = 'admin' | 'user';

export interface JwtUser {
    id: string;
    name: string;
}

export interface User {
    id: string;
    name: string;
    tenants?: Tenant[];
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface UserPermissions {
    user_id: string;
    permissions: string[][];
    roles: string[];
}

export interface Profile {
    id: string;
    name: string;
    is_active: boolean;
    tenants: Tenant[];
}

export interface Tenant {
    id: string;
    name: string;
}

// 用户管理相关类型
export interface CreateUserRequest {
    name: string;
    password: string;
    is_active?: boolean;
    create_tenant?: boolean;
    tenant_roles?: TenantRoleAssignment[];
}

export interface UpdateUserRequest {
    name?: string;
    is_active?: boolean;
}

export interface ProfileUpdateRequest {
    name?: string;
    avatar?: string;
}

// 组管理相关类型
export interface CreateGroupRequest {
    name: string;
    description: string;
    color?: string;
    permissions?: GroupPermission[];
}

export interface UpdateGroupRequest {
    name?: string;
    description?: string;
    color?: string;
    permissions?: GroupPermission[];
}