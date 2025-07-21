import { Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole } from '@/types/user';

interface UserFiltersProps {
  searchTerm: string;
  roleFilter: UserRole | 'all';
  totalUsers: number;
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: UserRole | 'all') => void;
}

export function UserFilters({
  searchTerm,
  roleFilter,
  totalUsers,
  onSearchChange,
  onRoleFilterChange
}: UserFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="relative">
        <Input
          placeholder="搜索用户..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Select value={roleFilter} onValueChange={onRoleFilterChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="所有角色" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">所有角色</SelectItem>
          <SelectItem value="admin">管理员</SelectItem>
          <SelectItem value="user">普通用户</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex-1" />
      
      <div className="flex items-center text-sm text-muted-foreground">
        <Users className="mr-1 h-4 w-4" />
        共 {totalUsers} 个用户
      </div>
    </div>
  );
}
