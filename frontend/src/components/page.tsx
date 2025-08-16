import React from 'react';
import {PageHeader} from '@/components/page-header.tsx';
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

// 主Page组件
export function Page({
                         title,
                         description,
                         action,
                         isLoading = false,
                         loadingMessage = "加载中...",
                         children,
                         className = ""
                     }: PageProps) {
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
}

// PageContent组件 - 用于包装页面内容区域
export function PageContent({children, className = ""}: PageContentProps) {
    return (
        <div className={`space-y-6 ${className}`}>
            {children}
        </div>
    );
}

// 导出类型供其他组件使用
export type {PageAction, PageProps, PageContentProps};