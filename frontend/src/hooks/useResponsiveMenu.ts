import {useState, useEffect, useCallback} from "react";

export function useResponsiveMenu(breakpoint = 1024) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(
        typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
    );

    // 防抖函数
    const debounce = useCallback(<T extends (...args: unknown[]) => void>(func: T, wait: number) => {
        let timeout: NodeJS.Timeout;
        return (...args: Parameters<T>) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }, []);

    useEffect(() => {
        const handleResize = debounce(() => {
            const wasMobile = isMobile;
            const nowMobile = window.innerWidth < breakpoint;
            
            setIsMobile(nowMobile);
            
            // 只有在从桌面端切换到移动端时才关闭菜单
            // 这样可以避免在移动端打开菜单时，轻微的窗口大小变化导致菜单关闭
            if (wasMobile && !nowMobile) {
                setIsMobileMenuOpen(false);
            }
        }, 100); // 100ms 防抖
        
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [breakpoint, isMobile, debounce]);

    return {isMobile, isMobileMenuOpen, setIsMobileMenuOpen};
}
