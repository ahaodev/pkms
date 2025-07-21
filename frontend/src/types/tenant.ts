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