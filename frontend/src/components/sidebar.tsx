import {useCallback, useEffect, useRef, useState} from "react";
import {NavLink, useLocation} from "react-router-dom";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {
    BarChart3,
    Boxes,
    ChevronDown,
    Globe,
    Lock,
    Package,
    Rocket,
    Settings as SettingsIcon,
    Share2,
    Shield,
    Users,
    X
} from "lucide-react";
import type {NavItemProps, SimpleSidebarProps} from '@/types';
import {useAuth} from '@/providers/auth-provider.tsx';
import {apiClient} from '@/lib/api/api';
import {Tenant} from '@/types/user';

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
export function Sidebar({isOpen, onClose, onTenantChange}: SimpleSidebarProps & {
    tenantList?: { id: string, name: string }[],
    currentTenant?: { id: string, name: string } | null,
    onTenantChange?: (tenant: { id: string, name: string }) => void
}) {
    const location = useLocation();
    const sidebarRef = useRef<HTMLDivElement>(null);
    const {user} = useAuth();
    const [sidebarPermissions, setSidebarPermissions] = useState<string[]>([]);
    const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);


    const {currentTenant, tenants, selectTenant} = useAuth()

    // 切换租户逻辑
    const handleTenantChange = async (tenant: { id: string, name: string }) => {
        await selectTenant(tenant);
        if (onTenantChange) onTenantChange(tenant);
    };

    // 处理移动端点击导航项关闭菜单
    const handleNavClick = useCallback(() => {
        if (window.innerWidth < 1024) {
            onClose();
        }
    }, [onClose]);

    // 获取侧边栏权限
    const fetchSidebarPermissions = useCallback(async () => {
        if (!user || !currentTenant) return;

        try {
            const response = await apiClient.get('/api/v1/casbin/sidebar/permissions');
            if (response.data && response.data.code === 0) {
                setSidebarPermissions(response.data.data.sidebar || []);
            } else {
                setSidebarPermissions([]);
            }
        } catch (error) {
            // Silently handle permission fetch failures - just hide all sidebar items
            console.error(error)
            setSidebarPermissions([]);
        }
    }, [user, currentTenant]);

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
                        <div className="flex flex-row items-center relative w-full h-16">
                            <div
                                className="flex items-center justify-center rounded bg-primary text-primary-foreground mr-2 self-center"
                                style={{width: '32px', height: '32px', minWidth: '32px', minHeight: '32px'}}>
                                <Package className="h-4 w-4"/>
                            </div>
                            <div className="flex flex-col justify-center h-full w-full">
                                <span className="text-lg font-semibold leading-tight">PKMS</span>
                                {tenants && (
                                    <span
                                        className="text-base font-normal cursor-pointer flex items-center select-none w-full text-left mt-1"
                                        onClick={() => setTenantDropdownOpen((v) => !v)}
                                    >
                                        {currentTenant?.name}
                                        <ChevronDown className="ml-1 h-4 w-4"/>
                                    </span>
                                )}
                                {/* 租户下拉列表 */}
                                {tenantDropdownOpen && Array.isArray(tenants) && tenants.length > 0 && (
                                    <div
                                        className="absolute left-12 top-14 z-50 bg-white border rounded shadow-lg min-w-[180px]"
                                        onMouseLeave={() => setTenantDropdownOpen(false)}
                                    >
                                        {tenants?.map((tenant: Tenant) => (
                                            <div
                                                key={tenant.id}
                                                className={cn(
                                                    "px-4 py-2 cursor-pointer hover:bg-accent",
                                                    tenant.id === currentTenant?.id ? "bg-accent text-primary" : ""
                                                )}
                                                onClick={() => {
                                                    setTenantDropdownOpen(false);
                                                    handleTenantChange(tenant);
                                                }}
                                            >
                                                {tenant.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
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
                                    label="概览"
                                    end
                                    onClick={handleNavClick}
                                />
                            )}

                            {(hasPermission("projects") || hasPermission("packages")) && (
                                <NavItem
                                    to="/hierarchy"
                                    icon={<Boxes className="h-5 w-5"/>}
                                    label="项目包管理"
                                    onClick={handleNavClick}
                                />
                            )}

                            {hasPermission("upgrade") && (
                                <NavItem
                                    to="/upgrade"
                                    icon={<Rocket className="h-5 w-5"/>}
                                    label="升级管理"
                                    onClick={handleNavClick}
                                />
                            )}

                            {hasPermission("access-manager") && (
                                <NavItem
                                    to="/access-manager"
                                    icon={<Shield className="h-5 w-5"/>}
                                    label="接入管理"
                                    onClick={handleNavClick}
                                />
                            )}

                            {hasPermission("shares") && (
                                <NavItem
                                    to="/shares"
                                    icon={<Share2 className="h-5 w-5"/>}
                                    label="分享管理"
                                    onClick={handleNavClick}
                                />
                            )}

                            {hasPermission("tenants") && (
                                <NavItem
                                    to="/tenants"
                                    icon={<Globe className="h-5 w-5"/>}
                                    label="租户管理"
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
                        </div>
                    </ScrollArea>
                    {/* 版本号显示在左下角 */}
                    <div className="px-3 pb-3 mt-auto text-xs text-muted-foreground text-center select-none">
                        v0.0.1
                    </div>
                </div>
            </div>
        </>
    );
}
