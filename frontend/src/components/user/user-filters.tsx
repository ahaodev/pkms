import { Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole } from '@/types/user';
import { useI18n } from '@/contexts/i18n-context';

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
  const { t } = useI18n();
  
  return (
    <div className="flex flex-wrap gap-4">
      <div className="relative">
        <Input
          placeholder={t('user.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Select value={roleFilter} onValueChange={onRoleFilterChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder={t('user.allRoles')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('user.allRoles')}</SelectItem>
          <SelectItem value="admin">{t('user.admin')}</SelectItem>
          <SelectItem value="user">{t('user.user')}</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex-1" />
      
      <div className="flex items-center text-sm text-muted-foreground">
        <Users className="mr-1 h-4 w-4" />
        {t('user.totalUsers', { count: totalUsers })}
      </div>
    </div>
  );
}
