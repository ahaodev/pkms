import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTenants } from '@/hooks/use-tenants';
import type { Role, CreateRoleRequest, UpdateRoleRequest } from '@/types/role';

interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateRoleRequest) => void;
  isLoading: boolean;
}

export const CreateRoleDialog: React.FC<CreateRoleDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}) => {
  const { data: tenants = [] } = useTenants();
  
  // Predefined roles
  const predefinedRoles = [
    { code: 'admin', name: '管理员', description: '系统管理员，拥有所有权限' },
    { code: 'owner', name: '拥有者', description: '项目拥有者，拥有项目完整权限' },
    { code: 'user', name: '用户', description: '普通用户，拥有基本访问权限' },
    { code: 'viewer', name: '查看者', description: '只读用户，仅能查看内容' }
  ];

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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
            <Label htmlFor="code">角色类型 *</Label>
            <Select
              value={formData.code}
              onValueChange={(value) => {
                const selectedRole = predefinedRoles.find(r => r.code === value);
                setFormData({ 
                  ...formData, 
                  code: value,
                  name: selectedRole?.name || '',
                  description: selectedRole?.description || ''
                });
              }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="请选择角色类型" />
              </SelectTrigger>
              <SelectContent>
                {predefinedRoles.map((role) => (
                  <SelectItem key={role.code} value={role.code}>
                    {role.name} - {role.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              角色类型决定用户的权限范围
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

interface EditRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role;
  onSubmit: (data: UpdateRoleRequest) => void;
  isLoading: boolean;
}

export const EditRoleDialog: React.FC<EditRoleDialogProps> = ({
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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