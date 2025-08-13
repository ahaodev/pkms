import {memo, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {NavLink} from "react-router-dom";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {
    BarChart3,
    Boxes,
    ChevronDown,
    ChevronRight,
    Globe,
    Lock,
    Package,
    Rocket,
    Settings,
    Share2,
    Shield,
    Users,
    X
} from "lucide-react";
import type {NavItemProps, SimpleSidebarProps} from '@/types';
import {useAuth} from '@/providers/auth-provider.tsx';
import {apiClient} from '@/lib/api/api';
import {Tenant} from '@/types/user';
import {useI18n} from '@/contexts/i18n-context';

interface NavItemWithClickProps extends NavItemProps {
    onClick?: () => void;
}

/**
 * NavItem 组件：简化侧边栏导航项
 */
const NavItem = memo<NavItemWithClickProps>(({to, icon, label, end, onClick}) => {
    const navLinkClassName = useCallback(({isActive}: {isActive: boolean}) =>
        cn(
            "flex items-center space-x-3 w-full transition-all",
            isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
        ), []);

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
                className={navLinkClassName}
            >
                {icon}
                <span>{label}</span>
            </NavLink>
        </Button>
    );
});

NavItem.displayName = 'NavItem';

/**
 * CollapsibleGroup 组件：可折叠的菜单组
 */
interface CollapsibleGroupProps {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    storageKey: string;
}

const CollapsibleGroup = memo<CollapsibleGroupProps>(({
    icon,
    label,
    children,
    defaultOpen = false,
    storageKey
}) => {
    const [isOpen, setIsOpen] = useState(() => {
        const stored = localStorage.getItem(storageKey);
        return stored ? JSON.parse(stored) : defaultOpen;
    });

    const toggleOpen = useCallback(() => {
        setIsOpen((prev: boolean) => {
            const newValue = !prev;
            localStorage.setItem(storageKey, JSON.stringify(newValue));
            return newValue;
        });
    }, [storageKey]);

    return (
        <div className="space-y-1">
            <Button
                variant="ghost"
                className="w-full justify-start px-3 py-2 text-sm font-medium rounded-md hover:text-foreground"
                onClick={toggleOpen}
            >
                <div className="flex items-center space-x-3 w-full">
                    {icon}
                    <span className="flex-1 text-left">{label}</span>
                    {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                    ) : (
                        <ChevronRight className="h-4 w-4" />
                    )}
                </div>
            </Button>
            {isOpen && (
                <div className="ml-4 space-y-1">
                    {children}
                </div>
            )}
        </div>
    );
});

CollapsibleGroup.displayName = 'CollapsibleGroup';


interface SidebarProps extends SimpleSidebarProps {
    tenantList?: { id: string, name: string }[];
    currentTenant?: { id: string, name: string } | null;
    onTenantChange?: (tenant: { id: string, name: string }) => void;
}

/**
 * Sidebar 组件：简化版侧边栏，适用于简洁页面布局
 */
export const Sidebar = memo<SidebarProps>(({isOpen, onClose, onTenantChange}) => {
    const sidebarRef = useRef<HTMLDivElement>(null);
    const {user, currentTenant, tenants, selectTenant} = useAuth();
    const {t} = useI18n();
    const [sidebarPermissions, setSidebarPermissions] = useState<string[]>([]);
    const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);

    // 切换租户逻辑
    const handleTenantChange = useCallback(async (tenant: { id: string, name: string }) => {
        await selectTenant(tenant);
        onTenantChange?.(tenant);
    }, [selectTenant, onTenantChange]);

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
        } catch {
            // Silently handle permission fetch failures - just hide all sidebar items
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

    // 导航项配置，避免重复渲染
    const navigationItems = useMemo(() => [
        {
            permission: "dashboard",
            to: "/",
            icon: <BarChart3 className="h-5 w-5"/>,
            label: t("nav.overview"),
            end: true
        },
        {
            permission: "projects",
            to: "/hierarchy",
            icon: <Boxes className="h-5 w-5"/>,
            label: t("nav.projectManagement")
        },
        {
            permission: "upgrade",
            to: "/upgrade",
            icon: <Rocket className="h-5 w-5"/>,
            label: t("nav.upgradeManagement")
        },
        {
            permission: "access-manager",
            to: "/access-manager",
            icon: <Shield className="h-5 w-5"/>,
            label: t("nav.accessManagement")
        },
        {
            permission: "shares",
            to: "/shares",
            icon: <Share2 className="h-5 w-5"/>,
            label: t("nav.shareManagement")
        }
    ], [t]);

    // 系统管理菜单项配置
    const systemManagementItems = useMemo(() => [
        {
            permission: "system", // 统一使用 system 权限
            to: "/tenants",
            icon: <Globe className="h-5 w-5"/>,
            label: t("nav.tenantManagement")
        },
        {
            permission: "system", // 统一使用 systems 权限
            to: "/users",
            icon: <Users className="h-5 w-5"/>,
            label: t("nav.userManagement")
        },
        {
            permission: "system", // 统一使用 systems 权限
            to: "/permissions",
            icon: <Lock className="h-5 w-5"/>,
            label: t("nav.permissionManagement")
        }
    ], [t]);

    // 检查权限的辅助函数
    const checkPermission = useCallback((permission: string | string[]) => {
        if (Array.isArray(permission)) {
            return permission.some(p => hasPermission(p));
        }
        return hasPermission(permission);
    }, [hasPermission]);

    // 检查是否有系统管理权限
    const hasSystemManagementPermission = useMemo(() => {
        return hasPermission("system");
    }, [hasPermission]);

    // 移动端点击外部关闭、滚动处理和键盘导航
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        const isMobile = window.innerWidth < 1024;
        
        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            
            if (isMobile) {
                document.addEventListener("mousedown", handleClickOutside);
                document.body.style.overflow = 'hidden';
            }
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose]);


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
                                        className="absolute left-12 top-14 z-50 bg-background border rounded shadow-lg min-w-[180px]"
                                        onMouseLeave={() => setTenantDropdownOpen(false)}
                                    >
                                        {tenants.map((tenant: Tenant) => {
                                            const isSelected = tenant.id === currentTenant?.id;
                                            return (
                                                <div
                                                    key={tenant.id}
                                                    className={cn(
                                                        "px-4 py-2 cursor-pointer hover:bg-accent transition-colors",
                                                        isSelected ? "bg-accent text-primary" : ""
                                                    )}
                                                    onClick={() => {
                                                        setTenantDropdownOpen(false);
                                                        handleTenantChange(tenant);
                                                    }}
                                                >
                                                    {tenant.name}
                                                </div>
                                            );
                                        })}
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
                        <nav className="space-y-1" role="navigation" aria-label={t("nav.mainNavigation")}>
                            {/* 普通导航项 */}
                            {navigationItems.map((item) => {
                                if (!checkPermission(item.permission)) return null;
                                
                                return (
                                    <NavItem
                                        key={item.to}
                                        to={item.to}
                                        icon={item.icon}
                                        label={item.label}
                                        end={item.end}
                                        onClick={handleNavClick}
                                    />
                                );
                            })}

                            {/* 系统管理分组 */}
                            {hasSystemManagementPermission && (
                                <CollapsibleGroup
                                    icon={<Settings className="h-5 w-5" />}
                                    label={t("nav.systemManagement")}
                                    defaultOpen={false}
                                    storageKey="sidebar-system-management-expanded"
                                >
                                    {systemManagementItems.map((item) => (
                                        <NavItem
                                            key={item.to}
                                            to={item.to}
                                            icon={item.icon}
                                            label={item.label}
                                            onClick={handleNavClick}
                                        />
                                    ))}
                                </CollapsibleGroup>
                            )}
                        </nav>
                    </ScrollArea>
                    {/* 版本号显示在左下角 */}
                    <div className="px-3 pb-3 mt-auto text-xs text-muted-foreground text-center select-none">
                        v0.0.1
                    </div>
                </div>
            </div>
        </>
    );
});

Sidebar.displayName = 'Sidebar';
