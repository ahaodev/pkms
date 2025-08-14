import {Eye, EyeOff, Pencil, Trash2} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Group} from '@/types/group';
import {Project} from '@/types/project';
import {User} from '@/types/user';
import {useI18n} from '@/contexts/i18n-context';

interface UserCardProps {
    user: User;
    currentUser: User | null;
    projects?: Project[];
    groups?: Group[];
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
    onToggleStatus: (user: User) => void;
}

export function UserCard({
                             user,
                             currentUser,
                             onEdit,
                             onDelete,
                             onToggleStatus
                         }: UserCardProps) {
    const { t } = useI18n();
    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="text-2xl shrink-0">{user.name.charAt(0).toUpperCase()}</div>
                        <div className="min-w-0 flex-1">
                            <CardTitle className="text-lg truncate">{user.name}</CardTitle>
                            <CardDescription className="truncate">ID: {user.id}</CardDescription>
                        </div>
                    </div>
                    <div className="flex space-x-1 shrink-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onToggleStatus(user)}
                            disabled={user.id === currentUser?.id}
                            title={user.is_active ? t('user.disableUser') : t('user.enableUser')}
                        >
                            {user.is_active ? <Eye className="h-4 w-4"/> : <EyeOff className="h-4 w-4"/>}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(user)}
                            title={t('user.editUser')}
                        >
                            <Pencil className="h-4 w-4"/>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(user)}
                            disabled={user.id === currentUser?.id}
                            title={t('user.deleteUser')}
                        >
                            <Trash2 className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline">
                        {t('user.user')}
                    </Badge>
                    <Badge variant={user.is_active ? 'outline' : 'destructive'}>
                        {user.is_active ? t('user.enabled') : t('user.disabled')}
                    </Badge>
                    {user.id === currentUser?.id && (
                        <Badge variant="secondary">{t('user.currentUser')}</Badge>
                    )}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                    {t('user.createdAt')}：{user.created_at.toLocaleDateString()}
                </div>
            </CardContent>
        </Card>
    );
}
