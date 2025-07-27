export interface ClientAccess {
  id: string;
  tenant_id: string;
  project_id: string;
  package_id: string;
  access_token: string;
  name: string;
  description?: string;
  is_active: boolean;
  expires_at?: string;
  last_used_at?: string;
  last_used_ip?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  
  // 关联信息
  project_name?: string;
  package_name?: string;
  creator_name?: string;
}

export interface CreateClientAccessRequest {
  project_id: string;
  package_id: string;
  name: string;
  description?: string;
  expires_at?: string;
}

export interface UpdateClientAccessRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
  expires_at?: string;
}

export interface ClientAccessFilters {
  project_id?: string;
  package_id?: string;
  is_active?: boolean;
  search?: string;
}