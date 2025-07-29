/**
 * Permission utility functions for RBAC system
 */

// Role display names mapping - aligned with backend constants.go
const ROLE_DISPLAY_NAMES: Record<string, string> = {
  admin: '管理员',
  owner: '所有者',
  user: '用户',
  viewer: '查看者',
};

// Object/Resource display names mapping
const OBJECT_DISPLAY_NAMES: Record<string, string> = {
  project: '项目',
  package: '软件包',
  release: '发布版本',
  user: '用户',
  file: '文件',
  tenant: '租户',
  dashboard: '仪表板',
  upgrade: '升级',
  sidebar: '侧边栏',
};

// Action display names mapping
const ACTION_DISPLAY_NAMES: Record<string, string> = {
  read: '读取',
  write: '写入',
  delete: '删除',
  create: '创建',
  update: '更新',
  list: '列表',
  share: '分享',
  upload: '上传',
  download: '下载',
  access: '访问',
};

/**
 * Get display name for a role
 */
export function getRoleDisplayName(role: string): string {
  return ROLE_DISPLAY_NAMES[role] || role;
}

/**
 * Get display name for an object/resource
 */
export function getObjectDisplayName(object: string): string {
  return OBJECT_DISPLAY_NAMES[object] || object;
}

/**
 * Get display name for an action
 */
export function getActionDisplayName(action: string): string {
  return ACTION_DISPLAY_NAMES[action] || action;
}

/**
 * Get all available roles (including admin)
 */
export function getAvailableRoles(): string[] {
  return Object.keys(ROLE_DISPLAY_NAMES);
}

/**
 * Get assignable roles (excluding admin - system administrator)
 */
export function getAssignableRoles(): string[] {
  return Object.keys(ROLE_DISPLAY_NAMES).filter(role => role !== 'admin');
}

/**
 * Get all available objects/resources
 */
export function getAvailableObjects(): string[] {
  return Object.keys(OBJECT_DISPLAY_NAMES);
}

/**
 * Get all available actions
 */
export function getAvailableActions(): string[] {
  return Object.keys(ACTION_DISPLAY_NAMES);
}

/**
 * Check if a role is valid
 */
export function isValidRole(role: string): boolean {
  return role in ROLE_DISPLAY_NAMES;
}

/**
 * Check if an object/resource is valid
 */
export function isValidObject(object: string): boolean {
  return object in OBJECT_DISPLAY_NAMES;
}

/**
 * Check if an action is valid
 */
export function isValidAction(action: string): boolean {
  return action in ACTION_DISPLAY_NAMES;
}