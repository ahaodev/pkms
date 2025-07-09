import { User as UserIcon, Eye, EyeOff, Pencil, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Project, Group } from '@/types/simplified';

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
  projects,
  groups, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}: UserCardProps) {
  const getProjectNames = (projectIds: string[] = []): string => {
    if (!projects) return '';
    const names = projectIds
      .map(id => projects.find(p => p.id === id)?.name)
      .filter(Boolean);
    return names.join(', ');
  };

  const getGroupNames = (groupIds: string[] = []): string => {
    if (!groups) return '';
    const names = groupIds
      .map(id => groups.find(g => g.id === id)?.name)
      .filter(Boolean);
    return names.join(', ');
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="text-2xl flex-shrink-0">{user.avatar}</div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg truncate">{user.username}</CardTitle>
              <CardDescription className="truncate">{user.email}</CardDescription>
            </div>
          </div>
          <div className="flex space-x-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleStatus(user)}
              disabled={user.id === currentUser?.id}
              title={user.isActive ? '禁用用户' : '启用用户'}
            >
              {user.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(user)}
              title="编辑用户"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(user)}
              disabled={user.id === currentUser?.id}
              title="删除用户"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
            {user.role === 'admin' ? '管理员' : '普通用户'}
          </Badge>
          <Badge variant={user.isActive ? 'outline' : 'destructive'}>
            {user.isActive ? '启用' : '禁用'}
          </Badge>
          {user.id === currentUser?.id && (
            <Badge variant="secondary">当前用户</Badge>
          )}
        </div>

        {user.role === 'user' && user.assignedProjectIds && user.assignedProjectIds.length > 0 && (
          <div className="mt-3 p-2 bg-muted rounded text-xs">
            <div className="flex items-center mb-1">
              <UserIcon className="mr-1 h-3 w-3" />
              <span className="font-medium">分配的项目</span>
            </div>
            <p className="text-muted-foreground">
              {getProjectNames(user.assignedProjectIds)}
            </p>
          </div>
        )}

        {user.groupIds && user.groupIds.length > 0 && (
          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950 rounded text-xs">
            <div className="flex items-center mb-1">
              <Users className="mr-1 h-3 w-3" />
              <span className="font-medium">所属组</span>
            </div>
            <p className="text-muted-foreground">
              {getGroupNames(user.groupIds)}
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-2">
          创建于：{user.createdAt.toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}
