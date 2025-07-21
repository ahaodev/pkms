import {Smartphone, Globe, Monitor, Server, Package2, Zap, Wrench, Gamepad2, BarChart3, Lock, Star} from 'lucide-react';

// 常量定义
export const VERSIONS_PER_PAGE = 5;
export const SEARCH_DEBOUNCE_MS = 300;

// 类型图标映射
export const TYPE_ICONS = {
    android: <Smartphone className="h-5 w-5"/>,
    web: <Globe className="h-5 w-5"/>,
    desktop: <Monitor className="h-5 w-5"/>,
    linux: <Server className="h-5 w-5"/>,
    other: <Package2 className="h-5 w-5"/>
} as const;

// 项目图标映射
export const PROJECT_ICONS = {
    'package2': <Package2 className="h-4 w-4"/>,
    'smartphone': <Smartphone className="h-4 w-4"/>,
    'globe': <Globe className="h-4 w-4"/>,
    'monitor': <Monitor className="h-4 w-4"/>,
    'zap': <Zap className="h-4 w-4"/>,
    'wrench': <Wrench className="h-4 w-4"/>,
    'gamepad2': <Gamepad2 className="h-4 w-4"/>,
    'barchart3': <BarChart3 className="h-4 w-4"/>,
    'lock': <Lock className="h-4 w-4"/>,
    'star': <Star className="h-4 w-4"/>
} as const;

// 工具函数
export const formatFileSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export const compareVersions = (a: string, b: string): number => {
    const parseVersion = (version: string) => {
        return version.split('.').map(part => {
            const num = parseInt(part.replace(/[^\d]/g, ''), 10);
            return isNaN(num) ? 0 : num;
        });
    };

    const versionA = parseVersion(a);
    const versionB = parseVersion(b);

    for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
        const numA = versionA[i] || 0;
        const numB = versionB[i] || 0;

        if (numA > numB) return -1;
        if (numA < numB) return 1;
    }
    return 0;
};

export const getPackageKey = (pkg: { name: string; type: string }): string => `${pkg.name}-${pkg.type}`;

export const getProjectIcon = (iconType: string) => {
    return PROJECT_ICONS[iconType as keyof typeof PROJECT_ICONS] || PROJECT_ICONS['package2'];
};

export const getTypeIcon = (type: string) => {
    return TYPE_ICONS[type as keyof typeof TYPE_ICONS] || TYPE_ICONS['other'];
};
