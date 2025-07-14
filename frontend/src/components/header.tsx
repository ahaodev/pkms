import {Button} from "@/components/ui/button";
import {ModeToggle} from "@/components/mode-toggle";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Menu, LogOut, User as UserIcon} from "lucide-react";
import {useAuth} from "@/contexts/auth-context.tsx";
import type {HeaderProps} from '@/types';

/**
 * Header 组件：顶部导航栏，包含菜单按钮、主题切换、用户信息等
 */

export function Header({onMenuClick, isMobile}: HeaderProps) {
    const {user, logout} = useAuth();

    return (
        <header
            className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 py-3 px-4 flex items-center justify-between h-16">
            {isMobile && (
                <Button variant="ghost" size="icon" onClick={onMenuClick}>
                    <Menu className="h-5 w-5"/>
                    <span className="sr-only">Toggle menu</span>
                </Button>
            )}

            <div className="flex-1"/>

            <div className="flex items-center space-x-2">
                <ModeToggle/>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost"
                                className="relative flex items-center space-x-2 h-8 hover:bg-accent focus:bg-accent rounded-full pr-2 pl-1">
                            <Avatar className="h-7 w-7">
                                <AvatarFallback>{user?.avatar || '👤'}</AvatarFallback>
                            </Avatar>
                            {!isMobile && <span className="max-w-[100px] truncate">{user?.username || '用户'}</span>}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{user?.username || '用户'}</DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem>
                            <UserIcon className="mr-2 h-4 w-4"/>
                            <span>个人资料</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem onClick={logout}>
                            <LogOut className="mr-2 h-4 w-4"/>
                            <span>退出登录</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}