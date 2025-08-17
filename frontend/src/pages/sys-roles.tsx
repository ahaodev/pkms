// 角色管理页面

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { PermissionButton, PermissionGuard } from '@/components/permissions/permission-guard';
import { Page, PageHeader, PageContent } from '@/components/page';
import { useRoleManagement } from '@/hooks/use-roles';
import { useTenants } from '@/hooks/use-tenants';
import { CreateRoleDialog, EditRoleDialog, RoleTable } from '@/components/sys-role';
import type { Role } from '@/types/role';

const RoleManagement: React.FC = () => {
  const {
    roles,
    isLoading,
    createRole,
    updateRole,
    deleteRole,
  } = useRoleManagement();
  
  const { data: tenants = [] } = useTenants();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // 获取租户名称的辅助函数
  const getTenantName = (tenantId?: string) => {
    if (!tenantId) return '系统全局';
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant?.name || tenantId;
  };

  // 处理编辑角色
  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setIsEditDialogOpen(true);
  };

  // 处理删除角色
  const handleDeleteRole = async (role: Role) => {
    if (role.is_system) {
      alert('系统角色无法删除');
      return;
    }

    if (confirm(`确定要删除角色"${role.name}"吗？这将影响所有拥有此角色的用户。`)) {
      try {
        await deleteRole.mutateAsync(role.id);
      } catch (error) {
        alert('删除失败：' + (error as Error).message);
      }
    }
  };

  return (
    <PermissionGuard 
      permission="role:read"
      fallback={<div className="text-center py-8 text-muted-foreground">无权限访问</div>}
    >
      <Page isLoading={isLoading}>
        <PageHeader
          title="角色管理"
          description="管理系统角色和权限分配"
        />
        
        {/* 带权限控制的创建按钮 */}
        <div className="flex justify-end">
          <PermissionButton
            permission="role:create"
            onClick={() => setIsCreateDialogOpen(true)}
            variant="default"
          >
            <Plus className="h-4 w-4 mr-2" />
            创建角色
          </PermissionButton>
        </div>
        
        <PageContent>
        {/* 角色列表 */}
        <Card>
          <CardContent>
            <RoleTable
              roles={roles}
              getTenantName={getTenantName}
              onEditRole={handleEditRole}
              onDeleteRole={handleDeleteRole}
            />

            {roles.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                暂无角色数据
              </div>
            )}
          </CardContent>
        </Card>

        {/* 创建角色对话框 */}
        <CreateRoleDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSubmit={(data) => createRole.mutate(data)}
          isLoading={createRole.isPending}
        />

        {/* 编辑角色对话框 */}
        {selectedRole && (
          <EditRoleDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            role={selectedRole}
            onSubmit={(data) =>
              updateRole.mutate({ id: selectedRole.id, data })
            }
            isLoading={updateRole.isPending}
          />
        )}
        </PageContent>
      </Page>
    </PermissionGuard>
  );
};


export default RoleManagement;