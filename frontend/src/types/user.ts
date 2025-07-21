import {GroupPermission} from "@/types/group.ts";

export type UserRole = 'admin' | 'user';

export interface JwtUser {
    id: string;
    name: string;
}

export interface User {
    id: string;
    username: string;
    email: string;
    isActive: boolean;
    createdAt: Date;
}

export interface Profile {
    id: string;
    name: string;
    is_active: boolean;
    tenants: Tenant[];
}
export interface Profile {
    id: string;
    name:string;
    is_active: boolean;
    tenants: Tenant[];
}

export interface Tenant {
    id: string;
    name: string;
}

// 用户管理相关类型
export interface CreateUserRequest {
    username: string;
    email: string;
    password: string;
    role: UserRole;
    assignedProjectIds?: string[];
    groupIds?: string[];
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
// 用户管理相关类型
export interface CreateUserRequest {
    username: string;
    email: string;
    password: string;
    role: UserRole;
    assignedProjectIds?: string[];
    groupIds?: string[];
}