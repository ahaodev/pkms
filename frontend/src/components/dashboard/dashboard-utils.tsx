import { Smartphone, Globe, Monitor, Package2 } from 'lucide-react';

// 类型图标映射
export const TYPE_ICONS = {
  android: Smartphone,
  web: Globe,
  desktop: Monitor,
  linux: Monitor, // 使用 Monitor 图标代表 Linux
  other: Package2
} as const;

// 工具函数
export const getTypeIcon = (type: string) => {
  const IconComponent = TYPE_ICONS[type as keyof typeof TYPE_ICONS] || TYPE_ICONS.other;
  return <IconComponent className="h-4 w-4" />;
};

export const formatFileSize = (bytes: number): string => {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};
