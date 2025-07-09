import { useState } from 'react';
import { useAuth } from '@/contexts/simple-auth-context';
import { Group } from '@/types/simplified';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Users, 
  Shield, 
  Edit, 
  Trash2, 
  Calendar 
} from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface GroupListProps {
  groups: Group[];
  onEdit: (group: Group) => void;
  onManageMembers: (group: Group) => void;
  onManagePermissions: (group: Group) => void;
}

export function GroupList({ 
  groups, 
  onEdit, 
  onManageMembers, 
  onManagePermissions 
}: GroupListProps) {
  const { isAdmin, deleteGroup } = useAuth();
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null);

  const handleDelete = async (groupId: string) => {
    if (!confirm('确定要删除这个组吗？这将移除所有成员关系。')) return;
    
    setDeletingGroupId(groupId);
    try {
      await deleteGroup(groupId);
    } catch (error) {
      console.error('删除组失败:', error);
    } finally {
      setDeletingGroupId(null);
    }
  };

  if (groups.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">暂无组</h3>
            <p className="text-muted-foreground">创建第一个组来管理用户权限</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {groups.map((group) => (
        <Card key={group.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8" style={{ backgroundColor: group.color }}>
                <AvatarFallback style={{ backgroundColor: group.color, color: 'white' }}>
                  {group.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-base">{group.name}</CardTitle>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">打开菜单</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(group)}>
                  <Edit className="mr-2 h-4 w-4" />
                  编辑
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onManageMembers(group)}>
                  <Users className="mr-2 h-4 w-4" />
                  管理成员
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onManagePermissions(group)}>
                  <Shield className="mr-2 h-4 w-4" />
                  管理权限
                </DropdownMenuItem>
                {isAdmin() && (
                  <DropdownMenuItem 
                    onClick={() => handleDelete(group.id)}
                    className="text-destructive"
                    disabled={deletingGroupId === group.id}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    删除
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {group.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{group.memberCount} 成员</span>
                </div>
                <Badge variant="secondary">
                  {group.permissions.length} 个项目权限
                </Badge>
              </div>

              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>
                  创建于 {format(group.createdAt, 'yyyy-MM-dd', { locale: zhCN })}
                </span>
              </div>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onManageMembers(group)}
                >
                  <Users className="mr-1 h-3 w-3" />
                  成员
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onManagePermissions(group)}
                >
                  <Shield className="mr-1 h-3 w-3" />
                  权限
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
