// 简化的类型定义

export type UserRole = 'admin' | 'user';

export interface Group {
  id: string;
  name: string;
  description: string;
  color?: string; // 组标识颜色
  createdAt: Date;
  updatedAt: Date;
  memberCount: number;
  createdBy: string; // 创建者用户ID
  permissions: GroupPermission[];
}

export interface GroupPermission {
  projectId: string;
  canView: boolean;
  canEdit: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: UserRole;
  createdAt: Date;
  isActive: boolean;
  assignedProjectIds?: string[]; // 普通用户被分配的项目ID列表
  groupIds?: string[]; // 用户所属的组ID列表
}

export interface Project {
  id: string;
  name: string;
  description: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
  packageCount: number;
  createdBy: string; // 创建者用户ID
  isPublic: boolean; // 是否公开项目
}

export interface Package {
  id: string;
  projectId: string;
  name: string;
  description: string;
  type: 'android' | 'web' | 'desktop' | 'linux' | 'other';
  version: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  checksum: string; // 文件校验和
  changelog?: string; // 更新日志
  isLatest: boolean; // 是否为最新版本
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
  
  // 版本比较信息
  versionCode: number; // 用于版本比较的数字
  minSdkVersion?: number; // 最小SDK版本 (移动端)
  targetSdkVersion?: number; // 目标SDK版本 (移动端)
  
  // 分享信息
  shareToken: string; // 分享令牌
  shareExpiry?: Date; // 分享过期时间
  isPublic: boolean; // 是否公开分享
}

export interface PackageFilters {
  projectId?: string;
  type?: Package['type'];
  isLatest?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface VersionInfo {
  packageId: string;
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  downloadUrl?: string;
  changelog?: string;
}

export interface ShareInfo {
  shareUrl: string;
  qrCodeUrl: string;
  expiresAt?: Date;
  downloadCount: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface PackageUpload {
  file: File;
  projectId: string;
  name: string;
  description: string;
  type: Package['type'];
  version: string;
  changelog?: string;
  isPublic?: boolean;
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

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
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

export interface GroupMembership {
  userId: string;
  groupId: string;
  joinedAt: Date;
  addedBy: string;
}

export interface UserProjectAssignment {
  userId: string;
  projectId: string;
  assignedAt: Date;
  assignedBy: string;
}

export interface ProjectPermission {
  userId: string;
  projectId: string;
  canView: boolean;
  canEdit: boolean;
}
