import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/simple-auth-context';
import { Group, CreateGroupRequest, UpdateGroupRequest, GroupPermission } from '@/types/simplified';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Shield, X } from 'lucide-react';

interface GroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: Group | null;
  mode: 'create' | 'edit';
}

// 预设颜色
const PRESET_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#ec4899', // pink
  '#6b7280', // gray
];

// 模拟项目数据
const MOCK_PROJECTS = [
  { id: '1', name: '前端项目' },
  { id: '2', name: '后端API' },
  { id: '3', name: '移动应用' },
  { id: '4', name: '数据平台' },
];

export function GroupDialog({ open, onOpenChange, group, mode }: GroupDialogProps) {
  const { createGroup, updateGroup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: PRESET_COLORS[0],
  });
  const [permissions, setPermissions] = useState<GroupPermission[]>([]);

  useEffect(() => {
    if (group && mode === 'edit') {
      setFormData({
        name: group.name,
        description: group.description,
        color: group.color || PRESET_COLORS[0],
      });
      setPermissions(group.permissions || []);
    } else {
      setFormData({
        name: '',
        description: '',
        color: PRESET_COLORS[0],
      });
      setPermissions([]);
    }
  }, [group, mode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      const groupData = {
        ...formData,
        permissions,
      };

      if (mode === 'create') {
        await createGroup(groupData as CreateGroupRequest);
      } else if (group) {
        await updateGroup(group.id, groupData as UpdateGroupRequest);
      }

      onOpenChange(false);
    } catch (error) {
      console.error('保存组失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProjectPermission = (projectId: string) => {
    if (permissions.find(p => p.projectId === projectId)) return;
    
    setPermissions(prev => [...prev, {
      projectId,
      canView: true,
      canEdit: false,
    }]);
  };

  const removeProjectPermission = (projectId: string) => {
    setPermissions(prev => prev.filter(p => p.projectId !== projectId));
  };

  const updateProjectPermission = (projectId: string, updates: Partial<GroupPermission>) => {
    setPermissions(prev => prev.map(p => 
      p.projectId === projectId ? { ...p, ...updates } : p
    ));
  };

  const availableProjects = MOCK_PROJECTS.filter(p => 
    !permissions.find(perm => perm.projectId === p.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? '创建组' : '编辑组'}
          </DialogTitle>
          <DialogDescription>
            设置组的基本信息和项目权限
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">组名</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="输入组名"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="组的描述信息"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>组颜色</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.color === color 
                        ? 'border-primary scale-110 shadow-md' 
                        : 'border-muted hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                  />
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* 项目权限 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">项目权限</h4>
                <p className="text-xs text-muted-foreground">
                  为该组配置对不同项目的访问权限
                </p>
              </div>
              {availableProjects.length > 0 && (
                <Select onValueChange={addProjectPermission}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="添加项目权限" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-3">
              {permissions.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-4">
                      <Shield className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-2">
                        暂无项目权限配置
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                permissions.map((permission) => {
                  const project = MOCK_PROJECTS.find(p => p.id === permission.projectId);
                  if (!project) return null;

                  return (
                    <Card key={permission.projectId}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{project.name}</CardTitle>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProjectPermission(permission.projectId)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`${permission.projectId}-view`}
                              checked={permission.canView}
                              onCheckedChange={(checked) =>
                                updateProjectPermission(permission.projectId, { canView: !!checked })
                              }
                            />
                            <Label htmlFor={`${permission.projectId}-view`} className="text-sm">
                              查看
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`${permission.projectId}-edit`}
                              checked={permission.canEdit}
                              onCheckedChange={(checked) =>
                                updateProjectPermission(permission.projectId, { canEdit: !!checked })
                              }
                            />
                            <Label htmlFor={`${permission.projectId}-edit`} className="text-sm">
                              编辑
                            </Label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim()}>
              {loading ? '保存中...' : mode === 'create' ? '创建' : '保存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
