import { useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { UserRole, Project, Group } from '@/types/simplified';

interface UserFormData {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  assignedProjectIds: string[];
  groupIds: string[];
  isActive: boolean;
}

interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  isEdit?: boolean;
  userForm: UserFormData;
  projects?: Project[];
  groups?: Group[];
  updateUserForm: (updates: Partial<UserFormData>) => void;
}

export function UserDialog({ 
  open, 
  onClose, 
  onSubmit, 
  title, 
  isEdit = false,
  userForm,
  projects,
  groups,
  updateUserForm
}: UserDialogProps) {
  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  }, [onClose]);

  const handleProjectToggle = useCallback((projectId: string, checked: boolean) => {
    const newIds = checked 
      ? [...userForm.assignedProjectIds, projectId]
      : userForm.assignedProjectIds.filter(id => id !== projectId);
    updateUserForm({ assignedProjectIds: newIds });
  }, [userForm.assignedProjectIds, updateUserForm]);

  const handleGroupToggle = useCallback((groupId: string, checked: boolean) => {
    const newIds = checked 
      ? [...userForm.groupIds, groupId]
      : userForm.groupIds.filter(id => id !== groupId);
    updateUserForm({ groupIds: newIds });
  }, [userForm.groupIds, updateUserForm]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isEdit ? '编辑用户信息和权限' : '创建新用户并分配权限'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              value={userForm.username}
              onChange={(e) => updateUserForm({ username: e.target.value })}
              placeholder="输入用户名"
            />
          </div>

          <div>
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              value={userForm.email}
              onChange={(e) => updateUserForm({ email: e.target.value })}
              placeholder="输入邮箱地址"
            />
          </div>

          {!isEdit && (
            <div>
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                value={userForm.password}
                onChange={(e) => updateUserForm({ password: e.target.value })}
                placeholder="输入密码"
              />
            </div>
          )}

          <div>
            <Label htmlFor="role">角色</Label>
            <Select value={userForm.role} onValueChange={(value: UserRole) => 
              updateUserForm({ role: value })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">管理员</SelectItem>
                <SelectItem value="user">普通用户</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {userForm.role === 'user' && (
            <div>
              <Label>分配的项目</Label>
              <div className="mt-2 space-y-2 max-h-32 overflow-y-auto scrollbar-thin">
                {projects?.map((project) => (
                  <div key={project.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`project-${project.id}`}
                      checked={userForm.assignedProjectIds.includes(project.id)}
                      onChange={(e) => handleProjectToggle(project.id, e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor={`project-${project.id}`} className="text-sm">
                      {project.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label>所属组</Label>
            <div className="mt-2 space-y-2 max-h-32 overflow-y-auto scrollbar-thin">
              {groups?.map((group) => (
                <div key={group.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`group-${group.id}`}
                    checked={userForm.groupIds.includes(group.id)}
                    onChange={(e) => handleGroupToggle(group.id, e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor={`group-${group.id}`} className="text-sm flex items-center gap-2">
                    {group.color && (
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: group.color }}
                      />
                    )}
                    {group.name}
                  </Label>
                </div>
              ))}
              {(!groups || groups.length === 0) && (
                <p className="text-sm text-muted-foreground">暂无可用组</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={userForm.isActive}
              onCheckedChange={(checked) => updateUserForm({ isActive: checked })}
            />
            <Label htmlFor="isActive">账户启用状态</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={onSubmit}>
            {isEdit ? '更新' : '创建'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
