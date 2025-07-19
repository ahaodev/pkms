interface AuthLayoutProps {
    children: React.ReactNode;
    className?: string;
}

export function AuthLayout({children, className}: AuthLayoutProps) {
    return (
        <div
            className={`w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 ${className || ''}`}>
            {children}
        </div>
    );
}
