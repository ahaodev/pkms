import {Package as PackageIcon, Users, Download, FolderOpen} from 'lucide-react';
import {StatCard} from './stat-card';

import type { DashboardStats } from '@/lib/api/dashboard';

interface StatsGridProps {
    stats?: DashboardStats;
}

// 统计卡片配置
const STAT_CARDS = [
    {
        key: 'totalProjects',
        title: '项目总数',
        icon: FolderOpen,
        suffix: '软件项目'
    },
    {
        key: 'totalPackages',
        title: '包总数',
        icon: PackageIcon,
        suffix: '软件包'
    },
    {
        key: 'totalUsers',
        title: '用户总数',
        icon: Users,
        suffix: '注册用户'
    },
    {
        key: 'totalDownloads',
        title: '总下载数',
        icon: Download,
        suffix: '累计下载次数'
    }
] as const;

export function StatsGrid({stats}: StatsGridProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {STAT_CARDS.map(({key, title, icon, suffix}) => (
                <StatCard
                    key={key}
                    title={title}
                    value={stats?.[key as keyof DashboardStats] ?? 0}
                    icon={icon}
                    suffix={suffix}
                />
            ))}
        </div>
    );
}
