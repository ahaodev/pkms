import {Sidebar} from "@/components/sidebar";
import {Header} from "@/components/header";
import {useResponsiveMenu} from "@/hooks/useResponsiveMenu";

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({children}: LayoutProps) {
    const {isMobile, isMobileMenuOpen, setIsMobileMenuOpen} = useResponsiveMenu();

    return (
        <div className="w-full h-screen bg-background flex">
            <Sidebar
                isOpen={isMobile ? isMobileMenuOpen : true}
                onClose={() => setIsMobileMenuOpen(false)}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header
                    onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    isMobile={isMobile}
                />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
