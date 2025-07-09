// Data types for the delivery system

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface Release {
  id: string;
  name: string;
  version: string;
  type: 'backend' | 'frontend' | 'api' | 'database' | 'mobile';
  status: 'ready' | 'deployed' | 'in_review' | 'in_progress' | 'in_development' | 'failed';
  createdAt: Date;
  author: string;
  description: string;
  environment: 'production' | 'staging' | 'qa' | 'development';
  artifacts?: Artifact[];
  changeLog?: string[];
}

export interface Artifact {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  checksum?: string;
}

export interface DeploymentStep {
  name: string;
  status: 'completed' | 'in_progress' | 'pending' | 'failed' | 'cancelled';
  duration: string;
  logs?: string[];
  error?: string;
}

export interface Deployment {
  id: string;
  name: string;
  environment: 'production' | 'staging' | 'qa' | 'development';
  status: 'successful' | 'failed' | 'in_progress' | 'cancelled' | 'pending';
  startTime: Date;
  endTime: Date | null;
  duration: string;
  triggeredBy: string;
  version: string;
  releaseId: string;
  steps: DeploymentStep[];
  logs?: string[];
  rollbackDeploymentId?: string;
}

export interface DashboardStats {
  totalReleases: number;
  totalDeployments: number;
  avgDeploymentTime: string;
  successRate: number;
  releasesGrowth: string;
  deploymentsGrowth: string;
  timeImprovement: string;
  successRateChange: string;
}

export interface ChartData {
  name: string;
  value?: number;
  deployments?: number;
  time?: number;
}

export interface Environment {
  name: string;
  value: number;
  color: string;
}

export interface ActivityItem {
  id: string;
  type: 'deployment' | 'release' | 'rollback' | 'approval';
  title: string;
  description: string;
  timestamp: Date;
  user: string;
  status: 'success' | 'failed' | 'pending' | 'in_progress';
  environment?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Filter and search types
export interface ReleaseFilters {
  status?: Release['status'];
  type?: Release['type'];
  environment?: Release['environment'];
  author?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface DeploymentFilters {
  status?: Deployment['status'];
  environment?: Deployment['environment'];
  triggeredBy?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// Storage types
export interface StorageFile {
  key: string;
  lastModified: Date;
  size: number;
  type: string;
  url: string;
}

// 业务组件 props 类型定义
/**
 * Header 组件 props
 * @param onMenuClick 菜单按钮点击回调
 * @param isMobile 是否为移动端
 */
export interface HeaderProps {
  onMenuClick: () => void;
  isMobile: boolean;
}

/**
 * Sidebar 组件 props
 * @param isOpen 是否显示侧边栏
 * @param onClose 关闭侧边栏回调
 */
export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * NavItem 组件 props
 * @param to 跳转路径
 * @param icon 图标节点
 * @param label 显示文本
 * @param end 是否精确匹配
 */
export interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
}

/**
 * ShareDialog 组件 props
 * @param isOpen 是否显示对话框
 * @param onClose 关闭对话框回调
 * @param shareUrl 分享链接
 * @param packageName 包名
 */
export interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  packageName: string;
}

/**
 * Layout 组件 props
 * @param children 子节点内容
 */
export interface SimpleLayoutProps {
  children: React.ReactNode;
}

/**
 * SimpleSidebar 组件 props
 * @param isOpen 是否显示侧边栏
 * @param onClose 关闭侧边栏回调
 */
export interface SimpleSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}
