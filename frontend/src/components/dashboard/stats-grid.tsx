import { Package as PackageIcon, Upload, Download, FolderOpen } from 'lucide-react';
import { StatCard } from './stat-card';

interface DashboardStats {
  totalProjects: number;
  totalPackages: number;
  recentUploads: number;
  totalDownloads: number;
}

interface StatsGridProps {
  stats: DashboardStats;
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
    key: 'recentUploads', 
    title: '今日上传', 
    icon: Upload, 
    suffix: '新包上传' 
  },
  { 
    key: 'totalDownloads', 
    title: '总下载数', 
    icon: Download, 
    suffix: '累计下载次数' 
  }
] as const;

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {STAT_CARDS.map(({ key, title, icon, suffix }) => (
        <StatCard 
          key={key}
          title={title}
          value={stats[key as keyof typeof stats]}
          icon={icon}
          suffix={suffix}
        />
      ))}
    </div>
  );
}
