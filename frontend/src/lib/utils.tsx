import {clsx, type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';
import {Smartphone, Globe, Monitor, Server, Package2, Zap, Wrench, Gamepad2, BarChart3, Lock, Star} from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('zh-CN');
}

// 统一的图标映射系统 - 从重复的定义中合并
export const TYPE_ICONS = {
    android: Smartphone,
    web: Globe,
    desktop: Monitor,
    linux: Server,
    other: Package2
} as const;

export const PROJECT_ICONS = {
    'package2': Package2,
    'smartphone': Smartphone,
    'globe': Globe,
    'monitor': Monitor,
    'zap': Zap,
    'wrench': Wrench,
    'gamepad2': Gamepad2,
    'barchart3': BarChart3,
    'lock': Lock,
    'star': Star
} as const;

export function getTypeIcon(type: string, className = "h-4 w-4") {
    const IconComponent = TYPE_ICONS[type as keyof typeof TYPE_ICONS] || TYPE_ICONS.other;
    return <IconComponent className={className} />;
}

export function getProjectIcon(iconType: string, className = "h-4 w-4") {
    const IconComponent = PROJECT_ICONS[iconType as keyof typeof PROJECT_ICONS] || PROJECT_ICONS['package2'];
    return <IconComponent className={className} />;
}

export const iconOptions = [
    {value: 'package2', label: 'Package'},
    {value: 'smartphone', label: 'Mobile'},
    {value: 'globe', label: 'Web'},
    {value: 'monitor', label: 'Desktop'},
    {value: 'zap', label: 'Performance'},
    {value: 'wrench', label: 'Tools'},
    {value: 'gamepad2', label: 'Games'},
    {value: 'barchart3', label: 'Analytics'},
    {value: 'lock', label: 'Security'},
    {value: 'star', label: 'Featured'}
];
