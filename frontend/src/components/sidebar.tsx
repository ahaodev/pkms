import {useCallback, useEffect, useRef, useState} from "react";
import {NavLink, useLocation} from "react-router-dom";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {BarChart3, FolderOpen, Lock, Package, Settings as SettingsIcon, Users, Wrench, X,} from "lucide-react";
import type {NavItemProps, SimpleSidebarProps} from '@/types';
import {useAuth} from '@/contexts/auth-context.tsx';
import {apiClient} from '@/lib/api/api';

/**
 * NavItem 组件：简化侧边栏导航项
 */
function NavItem({to, icon, label, end, onClick}: NavItemProps & { onClick?: () => void }) {
    return (
        <Button
            asChild
            variant="ghost"
            className="w-full justify-start px-3 py-2 text-sm font-medium rounded-md"
        >
            <NavLink
                to={to}
                end={end}
                onClick={onClick}
                className={({isActive}) =>
                    cn(
                        "flex items-center space-x-3 w-full transition-all",
                        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                    )
                }
            >
                {icon}
                <span>{label}</span>
            </NavLink>
        </Button>
    );
}

/**
 * SimpleSidebar 组件：简化版侧边栏，适用于简洁页面布局
 */
export function Sidebar({isOpen, onClose}: SimpleSidebarProps) {
    const location = useLocation();
    const sidebarRef = useRef<HTMLDivElement>(null);
    const {user} = useAuth();
    const [sidebarPermissions, setSidebarPermissions] = useState<string[]>([]);

    // 处理移动端点击导航项关闭菜单
    const handleNavClick = useCallback(() => {
        if (window.innerWidth < 1024) {
            onClose();
        }
    }, [onClose]);

    // 获取侧边栏权限
    const fetchSidebarPermissions = useCallback(async () => {
        if (!user) return;

        try {
            const response = await apiClient.get('/api/v1/casbin/sidebar/permissions');
            if (response.data && response.data.code === 0) {
                setSidebarPermissions(response.data.data.sidebar || []);
            }
        } catch (error) {
            console.error('获取侧边栏权限失败:', error);
            setSidebarPermissions([]);
        }
    }, [user]);

    useEffect(() => {
        fetchSidebarPermissions();
    }, [fetchSidebarPermissions]);

    // 检查是否有侧边栏权限
    const hasPermission = useCallback((item: string) => {
        return sidebarPermissions.includes(item);
    }, [sidebarPermissions]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                onClose();
            }
        }

        // 只在移动端打开时添加点击外部关闭的监听器
        if (isOpen && window.innerWidth < 1024) {
            document.addEventListener("mousedown", handleClickOutside);
            // 阻止背景滚动
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose]);

    // 移除自动关闭逻辑，让用户手动控制
    useEffect(() => {
        // 不再自动关闭菜单
    }, [location, onClose]);

    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
            />

            {/* Sidebar */}
            <div
                ref={sidebarRef}
                className={cn(
                    "fixed left-0 top-0 z-50 h-full w-64 bg-background border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex h-16 items-center justify-between border-b px-4">
                        <div className="flex items-center space-x-2">
                            <div
                                className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
                                <Package className="h-4 w-4"/>
                            </div>
                            <span className="text-lg font-semibold">PKMS</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="lg:hidden"
                            onClick={onClose}
                        >
                            <X className="h-5 w-5"/>
                        </Button>
                    </div>

                    {/* Navigation */}
                    <ScrollArea className="flex-1 px-3 py-4">
                        <div className="space-y-1">
                            {hasPermission("dashboard") && (
                                <NavItem
                                    to="/"
                                    icon={<BarChart3 className="h-5 w-5"/>}
                                    label="仪表板"
                                    end
                                    onClick={handleNavClick}
                                />
                            )}
                            {hasPermission("projects") && (
                                <NavItem
                                    to="/projects"
                                    icon={<FolderOpen className="h-5 w-5"/>}
                                    label="项目管理"
                                    onClick={handleNavClick}
                                />
                            )}
                            {hasPermission("packages") && (
                                <NavItem
                                    to="/packages"
                                    icon={<Package className="h-5 w-5"/>}
                                    label="包管理"
                                    onClick={handleNavClick}
                                />
                            )}
                            {hasPermission("users") && (
                                <NavItem
                                    to="/users"
                                    icon={<Users className="h-5 w-5"/>}
                                    label="用户管理"
                                    onClick={handleNavClick}
                                />
                            )}
                            {hasPermission("permissions") && (
                                <NavItem
                                    to="/permissions"
                                    icon={<Lock className="h-5 w-5"/>}
                                    label="权限管理"
                                    onClick={handleNavClick}
                                />
                            )}
                            {hasPermission("settings") && (
                                <NavItem
                                    to="/settings"
                                    icon={<SettingsIcon className="h-5 w-5"/>}
                                    label="设置"
                                    onClick={handleNavClick}
                                />
                            )}
                            {hasPermission("upgrade") && (
                                <NavItem
                                    to="/upgrade"
                                    icon={<Wrench className="h-5 w-5"/>}
                                    label="系统升级"
                                    onClick={handleNavClick}
                                />
                            )}
                        </div>
                    </ScrollArea>
                    {/* 版本号显示在左下角 */}
                    <div className="px-3 pb-3 mt-auto text-xs text-muted-foreground text-center select-none">
                        v1.5.0
                    </div>
                </div>
            </div>
        </>
    );
}
