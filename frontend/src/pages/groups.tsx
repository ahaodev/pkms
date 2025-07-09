import { useState } from 'react';
import { useAuth } from '@/contexts/simple-auth-context';
import { GroupList } from '@/components/group/group-list';
import { GroupDialog } from '@/components/group/group-dialog';
import { GroupMemberDialog } from '@/components/group/group-member-dialog';
import { GroupPermissionDialog } from '@/components/group/group-permission-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Group } from '@/types/simplified';

export default function GroupsPage() {
  const { getAllGroups, isAdmin } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [managingMembers, setManagingMembers] = useState<Group | null>(null);
  const [managingPermissions, setManagingPermissions] = useState<Group | null>(null);

  const groups = getAllGroups();

  const handleCreateGroup = () => {
    setShowCreateDialog(true);
  };

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
  };

  const handleManageMembers = (group: Group) => {
    setManagingMembers(group);
  };

  const handleManagePermissions = (group: Group) => {
    setManagingPermissions(group);
  };

  const handleCloseDialogs = () => {
    setShowCreateDialog(false);
    setEditingGroup(null);
    setManagingMembers(null);
    setManagingPermissions(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">权限管理</h1>
          <p className="text-muted-foreground">
            管理用户组、权限和成员关系
          </p>
        </div>
        {isAdmin() && (
          <Button onClick={handleCreateGroup}>
            <Plus className="mr-2 h-4 w-4" />
            创建组
          </Button>
        )}
      </div>

      <GroupList
        groups={groups}
        onEdit={handleEditGroup}
        onManageMembers={handleManageMembers}
        onManagePermissions={handleManagePermissions}
      />

      {/* 创建/编辑组对话框 */}
      <GroupDialog
        open={showCreateDialog || !!editingGroup}
        onOpenChange={handleCloseDialogs}
        group={editingGroup}
        mode={editingGroup ? 'edit' : 'create'}
      />

      {/* 管理成员对话框 */}
      {managingMembers && (
        <GroupMemberDialog
          open={!!managingMembers}
          onOpenChange={handleCloseDialogs}
          group={managingMembers}
        />
      )}

      {/* 管理权限对话框 */}
      {managingPermissions && (
        <GroupPermissionDialog
          open={!!managingPermissions}
          onOpenChange={handleCloseDialogs}
          group={managingPermissions}
        />
      )}
    </div>
  );
}
