import {memo, useCallback, useEffect, useRef, useState} from "react";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {ChevronDown, Package, X} from "lucide-react";
import type {SimpleSidebarProps} from '@/types';
import {useAuth} from '@/providers/auth-provider.tsx';
import {Tenant} from '@/types/user';
import {StaticNavigation} from '@/components/navigation/static-navigation';
import {getVersion} from "@/lib/api/version.ts";

// Static navigation replaces the dynamic menu system


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
    const {currentTenant, tenants, selectTenant} = useAuth();
    const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
    const [version, setVersion] = useState<string>("");

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
    useEffect(() => {
        getVersion()
            .then((resp) => {
                let backendVersion = resp.data;
                console.log(backendVersion)
                setVersion(backendVersion);
            })
            .catch((err) => {
                console.error(err)
            });

    }, []);

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

                    {/* Static Navigation */}
                    <ScrollArea className="flex-1 px-3 py-4">
                        <StaticNavigation onClick={handleNavClick}/>
                    </ScrollArea>
                    {/* 版本号显示在左下角 */}
                    <div className="px-3 pb-3 mt-auto text-xs text-muted-foreground text-center select-none">
                        {version ? (version.startsWith('v') ? version : `v${version}`) : ""}
                    </div>
                </div>
            </div>
        </>
    );
});

Sidebar.displayName = 'Sidebar';
