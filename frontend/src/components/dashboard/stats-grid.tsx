import {Download, FolderOpen, Package as PackageIcon, Tag} from 'lucide-react';
import {StatCard} from './stat-card';
import {useI18n} from '@/contexts/i18n-context';

import type {DashboardStats} from '@/lib/api/dashboard';

interface StatsGridProps {
    stats?: DashboardStats;
}

export function StatsGrid({stats}: StatsGridProps) {
    const {t} = useI18n();
    
    // 统计卡片配置
    const STAT_CARDS = [
        {
            key: 'totalProjects',
            title: t('stats.totalProjects'),
            icon: FolderOpen,
            suffix: t('stats.softwareProjects')
        },
        {
            key: 'totalPackages',
            title: t('stats.totalPackages'),
            icon: PackageIcon,
            suffix: t('stats.softwarePackages')
        },
        {
            key: 'totalReleases',
            title: t('stats.totalReleases'),
            icon: Tag,
            suffix: t('stats.softwareReleases')
        },
        {
            key: 'totalDownloads',
            title: t('stats.totalDownloads'),
            icon: Download,
            suffix: t('stats.totalDownloadCount')
        }
    ] as const;

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
