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
    tenant_id: string;
    user_id: string;
    role: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    created_by?: string;
    // 关联信息
    username: string;
    tenant_name?: string;
}

export interface TenantUserRequest {
    user_id: string;
    role: string;
}

export interface UpdateTenantUserRoleRequest {
    role: string;
    is_active: boolean;
}