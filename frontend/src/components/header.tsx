import {useState, useRef, useCallback} from "react";
import {Button} from "@/components/ui/button";
import {ModeToggle} from "@/components/mode-toggle";
import {LanguageToggle} from "@/components/language-toggle";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {LogOut, Menu, KeyRound} from "lucide-react";
import {useAuth} from "@/providers/auth-provider.tsx";
import {ChangePasswordDialog} from "@/components/change-password-dialog";
import {useI18n} from "@/contexts/i18n-context";
import type {HeaderProps} from '@/types';

/**
 * Header 组件：顶部导航栏，包含菜单按钮、主题切换、用户信息等
 */

export function Header({onMenuClick, isMobile}: HeaderProps) {
    const {user, logout} = useAuth();
    const {t} = useI18n();
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const handleChangePasswordClick = useCallback(() => {
        setDropdownOpen(false);
        setChangePasswordOpen(true);
    }, []);

    const handlePasswordDialogChange = useCallback((open: boolean) => {
        setChangePasswordOpen(open);
        if (!open) {
            // 延迟恢复焦点，确保弹窗完全关闭
            setTimeout(() => {
                triggerRef.current?.focus();
            }, 100);
        }
    }, []);

    return (
        <header
            className="border-b border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60 z-10 py-3 px-4 flex items-center justify-between h-16">
            {isMobile && (
                <Button variant="ghost" size="icon" onClick={onMenuClick}>
                    <Menu className="h-5 w-5"/>
                    <span className="sr-only">{t("common.toggleMenu")}</span>
                </Button>
            )}

            <div className="flex-1"/>

            <div className="flex items-center space-x-2">
                <LanguageToggle/>
                <ModeToggle/>

                <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button 
                            ref={triggerRef}
                            variant="ghost"
                            className="relative flex items-center space-x-2 h-8 hover:bg-accent focus:bg-accent rounded-full pr-2 pl-1"
                        >
                            {!isMobile && <span className="max-w-[100px] truncate">{user?.name || t("common.user")}</span>}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{user?.name || t("common.user")}</DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem onClick={handleChangePasswordClick}>
                            <KeyRound className="mr-2 h-4 w-4"/>
                            <span>{t("auth.changePassword")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem onClick={logout}>
                            <LogOut className="mr-2 h-4 w-4"/>
                            <span>{t("nav.logout")}</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            
            <ChangePasswordDialog
                open={changePasswordOpen}
                onOpenChange={handlePasswordDialogChange}
            />
        </header>
    );
}