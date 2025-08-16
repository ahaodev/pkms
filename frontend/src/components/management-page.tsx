import React from 'react';
import { Page, PageAction } from '@/components/page.tsx';
import { PermissionGuard, PermissionButton } from '@/components/permissions/permission-guard.tsx';
import { LucideIcon } from 'lucide-react';

interface ManagementPageAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;
  permission?: string; // Permission required for this action
}

interface ManagementPageProps {
  title: string;
  description: string;
  permission: string;
  action?: ManagementPageAction;
  isLoading?: boolean;
  loadingMessage?: string;
  children: React.ReactNode;
  className?: string;
  fallbackMessage?: string;
}

/**
 * ManagementPage - 专门为管理页面设计的组件
 * 集成了权限控制和统一的页面结构
 */
export function ManagementPage({ 
  title, 
  description, 
  permission,
  action, 
  isLoading = false, 
  loadingMessage = "加载中...", 
  children, 
  className = "",
  fallbackMessage = "无权限访问"
}: ManagementPageProps) {
  // Convert ManagementPageAction to PageAction with permission support
  const pageAction: PageAction | undefined = action ? {
    label: action.label,
    onClick: action.onClick,
    icon: action.icon,
    variant: action.variant,
    disabled: action.disabled,
  } : undefined;

  // If action has permission requirement, wrap it with PermissionButton
  const actionComponent = action && action.permission ? (
    <PermissionButton
      permission={action.permission}
      onClick={action.onClick}
      variant={action.variant}
      disabled={action.disabled}
    >
      {action.icon && <action.icon className="h-4 w-4 mr-2" />}
      {action.label}
    </PermissionButton>
  ) : undefined;

  return (
    <PermissionGuard 
      permission={permission} 
      fallback={<div className="text-center py-8 text-muted-foreground">{fallbackMessage}</div>}
    >
      <Page
        title={title}
        description={description}
        action={action?.permission ? undefined : pageAction}
        isLoading={isLoading}
        loadingMessage={loadingMessage}
        className={className}
      >
        {/* Custom action with permission check */}
        {actionComponent && (
          <div className="flex justify-end mb-6">
            {actionComponent}
          </div>
        )}
        {children}
      </Page>
    </PermissionGuard>
  );
}

export type { ManagementPageProps, ManagementPageAction };