export interface Tenant {
    id: string;
    name: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreateTenantRequest {
    name: string;
}

export interface UpdateTenantRequest {
    name?: string;
}

// 租户用户相关类型
export interface TenantUser {
    id: string;
    name: string;
    role: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface TenantUserRequest {
    user_id: string;
    role: string;
}

export interface UpdateTenantUserRoleRequest {
    role: string;
    is_active: boolean;
}