// Data types for the delivery system

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
 * SimpleSidebar 组件 props
 * @param isOpen 是否显示侧边栏
 * @param onClose 关闭侧边栏回调
 */
export interface SimpleSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}
