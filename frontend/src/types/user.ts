import {GroupPermission} from "@/types/group.ts";

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

export interface MenuItem {
    id: string;
    name: string;
    path: string;
    icon: string;
    component: string;
    sort: number;
    visible: boolean;
    requiresAuth: boolean;
    requiresAdmin: boolean;
}

export interface UserPermissions {
    user_id: string;
    permissions: string[][];
    roles: string[];
    menus: MenuItem[];        // 用户可访问的菜单列表
    is_admin: boolean;        // 是否管理员
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