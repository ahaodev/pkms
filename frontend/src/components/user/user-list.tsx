import { Users } from 'lucide-react';
import { User } from '@/types/user';
import { Project } from '@/types/project';
import { Group } from '@/types/group';
import { UserCard } from './user-card';
import { EmptyList } from '@/components/ui/empty-list';

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
  projects,
  groups, 
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          currentUser={currentUser}
          projects={projects}
          groups={groups}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
}
