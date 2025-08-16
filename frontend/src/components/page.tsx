import React, { memo } from 'react';
import { Button } from '@/components/ui/button.tsx';
import {LucideIcon} from 'lucide-react';

interface PageAction {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    disabled?: boolean;
}

interface PageProps {
    title: string;
    description: string;
    action?: PageAction;
    isLoading?: boolean;
    loadingMessage?: string;
    children: React.ReactNode;
    className?: string;
}

interface PageContentProps {
    children: React.ReactNode;
    className?: string;
}

// PageHeader component - merged from page-header.tsx and exported for standalone use
export const PageHeader = memo(({ title, description, action, className }: {
    title: string;
    description: string;
    action?: PageAction;
    className?: string;
}) => {
    return (
        <div className={`flex items-center justify-between ${className || ''}`}>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                <p className="text-muted-foreground">{description}</p>
            </div>
            {action && (
                <Button 
                    onClick={action.onClick}
                    variant={action.variant || 'default'}
                    className="flex items-center gap-2"
                    disabled={action.disabled}
                >
                    {action.icon && <action.icon className="h-4 w-4" />}
                    {action.label}
                </Button>
            )}
        </div>
    );
});

// 主Page组件 - 使用memo优化渲染
export const Page = memo(({
    title,
    description,
    action,
    isLoading = false,
    loadingMessage = "加载中...",
    children,
    className = ""
}: PageProps) => {
    // 如果正在加载，显示加载状态
    if (isLoading) {
        return (
            <div className={`space-y-6 ${className}`}>
                <PageHeader title={title} description={description}/>
                <div className="text-center py-8 text-muted-foreground">
                    {loadingMessage}
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            <PageHeader
                title={title}
                description={description}
                action={action}
            />
            {children}
        </div>
    );
});

// PageContent组件 - 用于包装页面内容区域，使用memo优化
export const PageContent = memo(({children, className = ""}: PageContentProps) => {
    return (
        <div className={`space-y-6 ${className}`}>
            {children}
        </div>
    );
});

// 导出类型供其他组件使用
export type {PageAction, PageProps, PageContentProps};