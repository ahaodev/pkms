import { Users, User as UserIcon, Edit, Trash2, MoreHorizontal, Ban, CheckCircle } from 'lucide-react';
import { User } from '@/types/user';
import { Project } from '@/types/project';
import { Group } from '@/types/group';
import { EmptyList } from '@/components/ui/empty-list';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserListProps {
  users: User[];
  currentUser: User | null;
  projects?: Project[];
  groups?: Group[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleStatus: (user: User) => void;
}

export function UserList({ 
  users, 
  currentUser,
  onEdit, 
  onDelete, 
  onToggleStatus 
}: UserListProps) {
  if (users.length === 0) {
    return (
      <EmptyList
        icon={Users}
        title="暂无用户"
        description="开始创建第一个用户"
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>用户名</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead>更新时间</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  {user.name}
                  {user.id === currentUser?.id && (
                    <Badge variant="outline" className="text-xs">
                      当前用户
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={user.is_active ? "default" : "secondary"} 
                  className={user.is_active ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                >
                  <div className="flex items-center gap-1">
                    {user.is_active ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <Ban className="h-3 w-3" />
                    )}
                    {user.is_active ? '活跃' : '禁用'}
                  </div>
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(user.created_at).toLocaleString('zh-CN')}
              </TableCell>
              <TableCell>
                {new Date(user.updated_at).toLocaleString('zh-CN')}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">打开菜单</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(user)}>
                      <Edit className="mr-2 h-4 w-4" />
                      编辑
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleStatus(user)}>
                      {user.is_active ? (
                        <>
                          <Ban className="mr-2 h-4 w-4" />
                          禁用
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          启用
                        </>
                      )}
                    </DropdownMenuItem>
                    {user.id !== currentUser?.id && (
                      <DropdownMenuItem 
                        onClick={() => onDelete(user)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        删除
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
