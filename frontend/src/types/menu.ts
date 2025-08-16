// Menu相关类型定义

export interface MenuAction {
  id: string;
  menu_id: string;
  name: string;
  code: string;
  resource: string;
  method?: string;
  permission_key: string;
  description?: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface Menu {
  id: string;
  name: string;
  path?: string;
  icon?: string;
  component?: string;
  sort: number;
  visible: boolean;
  is_system: boolean;
  tenant_id?: string;
  description?: string;
  parent_id?: string;
  children?: Menu[];
  actions?: MenuAction[];
  created_at: string;
  updated_at: string;
}

export interface MenuTreeNode {
  id: string;
  name: string;
  path?: string;
  icon?: string;
  component?: string;
  sort: number;
  visible: boolean;
  is_system: boolean;
  tenant_id?: string;
  description?: string;
  parent_id?: string;
  actions?: MenuAction[];
  created_at: string;
  updated_at: string;
  children?: MenuTreeNode[];
}

export interface CreateMenuRequest {
  name: string;
  path?: string;
  icon?: string;
  component?: string;
  sort: number;
  visible: boolean;
  tenant_id?: string;
  parent_id?: string;
  description?: string;
}

export interface UpdateMenuRequest {
  name?: string;
  path?: string;
  icon?: string;
  component?: string;
  sort?: number;
  visible?: boolean;
  parent_id?: string;
  description?: string;
}

export interface CreateMenuActionRequest {
  name: string;
  code: string;
  resource: string;
  method?: string;
  permission_key: string;
  description?: string;
}