import {Clock, FolderPlus, Package, UserPlus} from 'lucide-react';
import {EmptyList} from '@/components/ui/empty-list';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {RecentActivity} from '@/lib/api/dashboard';
import {useI18n} from '@/contexts/i18n-context';

interface RecentActivitiesProps {
    activities?: RecentActivity[];
    isLoading?: boolean;
}

const getActivityIcon = (type: string) => {
    switch (type) {
        case 'project_created':
            return <FolderPlus className="h-4 w-4 text-blue-500"/>;
        case 'package_created':
            return <Package className="h-4 w-4 text-green-500"/>;
        case 'user_joined':
            return <UserPlus className="h-4 w-4 text-purple-500"/>;
        default:
            return <Clock className="h-4 w-4 text-gray-500"/>;
    }
};

const getActivityBadgeColor = (type: string) => {
    switch (type) {
        case 'project_created':
            return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
        case 'package_created':
            return 'bg-green-100 text-green-800 hover:bg-green-200';
        case 'user_joined':
            return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
        default:
            return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
};

const formatActivityType = (type: string) => {
    switch (type) {
        case 'project_created':
            return '项目创建';
        case 'package_created':
            return '包创建';
        case 'user_joined':
            return '用户加入';
        default:
            return type;
    }
};

const formatRelativeTime = (dateString: string, t: (key: string) => string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
        return t('dashboard.justNow');
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes}${t('dashboard.minutesAgo')}`;
    } else if (diffInHours < 24) {
        return `${diffInHours}${t('dashboard.hoursAgo')}`;
    } else if (diffInDays < 7) {
        return `${diffInDays}${t('dashboard.daysAgo')}`;
    } else {
        return date.toLocaleDateString();
    }
};

export function RecentActivities({activities, isLoading}: RecentActivitiesProps) {
    const {t} = useI18n();
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5"/>
                        {t("dashboard.recentActivities")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 animate-pulse">
                                <div className="h-8 w-8 bg-gray-200 rounded-full"/>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"/>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"/>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!activities || activities.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5"/>
                        {t("dashboard.recentActivities")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <EmptyList
                        icon={Clock}
                        title={t("dashboard.noActivitiesTitle")}
                        description={t("dashboard.noActivitiesDesc")}
                    />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5"/>
                    最近活动
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities.map((activity) => (
                        <div key={activity.id}
                             className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-background border">
                                {getActivityIcon(activity.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="secondary" className={getActivityBadgeColor(activity.type)}>
                                        {formatActivityType(activity.type)}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(activity.created_at, t)}
                  </span>
                                </div>

                                <p className="text-sm text-foreground mb-2 leading-relaxed">
                                    {activity.description}
                                </p>

                                <div className="flex items-center gap-2">
                                    <Avatar className="h-5 w-5">
                                        <AvatarFallback className="text-xs">
                                            {activity.user_id.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-muted-foreground">
                    {activity.user_id}
                  </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default RecentActivities;