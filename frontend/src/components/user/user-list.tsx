import { Users, User as UserIcon, Edit, Trash2, MoreHorizontal, Ban, CheckCircle } from 'lucide-react';
import { User } from '@/types/user';
import { Group } from '@/types/group';
import { EmptyList } from '@/components/empty-list.tsx';
import { useI18n } from '@/contexts/i18n-context';
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
  const { t } = useI18n();
  
  if (users.length === 0) {
    return (
      <EmptyList
        icon={Users}
        title={t('user.noUsers')}
        description={t('user.createFirstUser')}
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('user.name')}</TableHead>
            <TableHead>{t('common.status')}</TableHead>
            <TableHead>{t('common.createdAt')}</TableHead>
            <TableHead>{t('common.updatedAt')}</TableHead>
            <TableHead className="text-right">{t('common.actions')}</TableHead>
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
                      {t('user.currentUser')}
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
                    {user.is_active ? t('user.active') : t('user.disabled')}
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
                      <span className="sr-only">{t('common.openMenu')}</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(user)}>
                      <Edit className="mr-2 h-4 w-4" />
                      {t('common.edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleStatus(user)}>
                      {user.is_active ? (
                        <>
                          <Ban className="mr-2 h-4 w-4" />
                          {t('user.disable')}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          {t('user.enable')}
                        </>
                      )}
                    </DropdownMenuItem>
                    {user.id !== currentUser?.id && (
                      <DropdownMenuItem 
                        onClick={() => onDelete(user)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('common.delete')}
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
