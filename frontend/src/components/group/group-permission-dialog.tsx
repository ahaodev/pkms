import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context.tsx';
import { Group, GroupPermission } from '@/types/simplified';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Shield, Plus, X, Eye, Edit } from 'lucide-react';

interface GroupPermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group;
}

// 模拟项目数据
const MOCK_PROJECTS = [
  { id: '1', name: '前端项目', description: 'React + TypeScript 前端应用' },
  { id: '2', name: '后端API', description: 'Node.js + Express API 服务' },
  { id: '3', name: '移动应用', description: 'React Native 移动端应用' },
  { id: '4', name: '数据平台', description: '数据分析和可视化平台' },
];

export function GroupPermissionDialog({ open, onOpenChange, group }: GroupPermissionDialogProps) {
  const { updateGroup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<GroupPermission[]>(group.permissions || []);
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateGroup(group.id, { permissions });
      onOpenChange(false);
    } catch (error) {
      console.error('保存权限失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProjectPermission = () => {
    if (!selectedProjectId || permissions.find(p => p.projectId === selectedProjectId)) {
      return;
    }
    
    setPermissions(prev => [...prev, {
      projectId: selectedProjectId,
      canView: true,
      canEdit: false,
    }]);
    
    setSelectedProjectId('');
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

  const getPermissionSummary = (permission: GroupPermission) => {
    const levels = [];
    if (permission.canView) levels.push('查看');
    if (permission.canEdit) levels.push('编辑');
    return levels.join(', ') || '无权限';
  };

  const getPermissionColor = (permission: GroupPermission) => {
    if (permission.canEdit) return 'default';
    if (permission.canView) return 'secondary';
    return 'outline';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Avatar 
              className="h-6 w-6" 
              style={{ backgroundColor: group.color }}
            >
              <AvatarFallback 
                style={{ backgroundColor: group.color, color: 'white' }}
                className="text-xs"
              >
                {group.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span>{group.name} - 权限管理</span>
          </DialogTitle>
          <DialogDescription>
            管理组对不同项目的访问权限
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 添加项目权限 */}
          {availableProjects.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">添加项目权限</h4>
              <div className="flex space-x-2">
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="选择要添加权限的项目" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        <div>
                          <div className="font-medium">{project.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {project.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={addProjectPermission} 
                  disabled={!selectedProjectId}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  添加
                </Button>
              </div>
            </div>
          )}

          <Separator />

          {/* 权限列表 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">项目权限配置</h4>
              <Badge variant="secondary">
                {permissions.length} 个项目
              </Badge>
            </div>

            {permissions.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-6">
                    <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">暂无权限配置</h3>
                    <p className="text-muted-foreground">
                      为该组添加项目权限以控制成员访问
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {permissions.map((permission) => {
                  const project = MOCK_PROJECTS.find(p => p.id === permission.projectId);
                  if (!project) return null;

                  return (
                    <Card key={permission.projectId}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">{project.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {project.description}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getPermissionColor(permission)}>
                              {getPermissionSummary(permission)}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeProjectPermission(permission.projectId)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`${permission.projectId}-view`}
                                checked={permission.canView}
                                onCheckedChange={(checked) =>
                                  updateProjectPermission(permission.projectId, { canView: !!checked })
                                }
                              />
                              <Eye className="h-4 w-4 text-muted-foreground" />
                              <Label 
                                htmlFor={`${permission.projectId}-view`} 
                                className="text-sm font-medium"
                              >
                                查看权限
                              </Label>
                            </div>
                            <p className="text-xs text-muted-foreground ml-6">
                              可以查看项目和包列表
                            </p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`${permission.projectId}-edit`}
                                checked={permission.canEdit}
                                onCheckedChange={(checked) =>
                                  updateProjectPermission(permission.projectId, { canEdit: !!checked })
                                }
                              />
                              <Edit className="h-4 w-4 text-muted-foreground" />
                              <Label 
                                htmlFor={`${permission.projectId}-edit`} 
                                className="text-sm font-medium"
                              >
                                编辑权限
                              </Label>
                            </div>
                            <p className="text-xs text-muted-foreground ml-6">
                              可以上传、编辑和删除包
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? '保存中...' : '保存权限'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
