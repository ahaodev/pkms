// 角色管理页面

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit, Plus } from 'lucide-react';
import { PermissionButton, PermissionGuard } from '@/components/permissions/permission-guard';
import { Page, PageHeader, PageContent } from '@/components/page';
import { useRoleManagement } from '@/hooks/use-roles';
import { useTenants } from '@/hooks/use-tenants';
import type { Role, CreateRoleRequest, UpdateRoleRequest } from '@/types/role';

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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>角色名称</TableHead>
                  <TableHead>角色代码</TableHead>
                  <TableHead>所属租户</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>
                      <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                        {role.code}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {getTenantName(role.tenant_id)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {role.description || '-'}
                    </TableCell>
                    <TableCell>
                      {role.is_system ? (
                        <Badge variant="secondary">系统角色</Badge>
                      ) : (
                        <Badge variant="outline">自定义</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {role.is_active ? (
                        <Badge variant="default" className="bg-green-500">
                          活跃
                        </Badge>
                      ) : (
                        <Badge variant="destructive">禁用</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(role.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <PermissionButton
                          permission="role:update"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRole(role)}
                        >
                          <Edit className="h-4 w-4" />
                        </PermissionButton>

                        <PermissionButton
                          permission="role:delete"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRole(role)}
                          disabled={role.is_system}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </PermissionButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

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

// 创建角色对话框组件
interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateRoleRequest) => void;
  isLoading: boolean;
}

const CreateRoleDialog: React.FC<CreateRoleDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}) => {
  const { data: tenants = [] } = useTenants();
  const [formData, setFormData] = useState<CreateRoleRequest>({
    name: '',
    code: '',
    description: '',
    tenant_id: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim() || !formData.tenant_id.trim()) {
      alert('请填写角色名称、角色代码和选择租户');
      return;
    }
    onSubmit(formData);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      tenant_id: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetForm();
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>创建角色</DialogTitle>
          <DialogDescription>
            创建新的角色。角色代码必须唯一且不能修改。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="tenant">所属租户 *</Label>
            <Select
              value={formData.tenant_id}
              onValueChange={(value) =>
                setFormData({ ...formData, tenant_id: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="请选择租户" />
              </SelectTrigger>
              <SelectContent>
                {tenants.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              角色必须归属于特定租户
            </p>
          </div>

          <div>
            <Label htmlFor="name">角色名称 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="例如：项目经理"
              required
            />
          </div>

          <div>
            <Label htmlFor="code">角色代码 *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value.toLowerCase() })
              }
              placeholder="例如：pm"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              角色代码将用于权限控制，只能包含字母、数字和下划线
            </p>
          </div>

          <div>
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="角色描述..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '创建中...' : '创建'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// 编辑角色对话框组件
interface EditRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role;
  onSubmit: (data: UpdateRoleRequest) => void;
  isLoading: boolean;
}

const EditRoleDialog: React.FC<EditRoleDialogProps> = ({
  open,
  onOpenChange,
  role,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<UpdateRoleRequest>({
    name: role.name,
    description: role.description || '',
    is_active: role.is_active,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert('请填写角色名称');
      return;
    }
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>编辑角色</DialogTitle>
          <DialogDescription>
            修改角色信息。系统角色的某些属性无法修改。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">角色名称 *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              disabled={role.is_system}
            />
          </div>

          <div>
            <Label htmlFor="edit-code">角色代码</Label>
            <Input
              id="edit-code"
              value={role.code}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              角色代码创建后无法修改
            </p>
          </div>

          <div>
            <Label htmlFor="edit-description">描述</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="edit-active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_active: checked })
              }
              disabled={role.is_system}
            />
            <Label htmlFor="edit-active">启用角色</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '保存中...' : '保存'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RoleManagement;