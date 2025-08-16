// Menu管理页面

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, EyeOff } from 'lucide-react';
import { menuApi } from '@/lib/api/menu';
import { PermissionGuard, PermissionButton } from '@/components/permissions/permission-guard';
import type { MenuTreeNode, CreateMenuRequest, UpdateMenuRequest } from '@/types/menu';

const MenuManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuTreeNode | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  // 获取菜单树
  const { data: menuTree = [], isPending } = useQuery({
    queryKey: ['menuTree'],
    queryFn: menuApi.getMenuTree,
    staleTime: 2 * 60 * 1000, // 2分钟缓存
  });

  // 创建菜单
  const createMenuMutation = useMutation({
    mutationFn: menuApi.createMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuTree'] });
      setIsCreateDialogOpen(false);
    },
  });

  // 更新菜单
  const updateMenuMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMenuRequest }) =>
      menuApi.updateMenu(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuTree'] });
      setIsEditDialogOpen(false);
      setSelectedMenu(null);
    },
  });

  // 删除菜单
  const deleteMenuMutation = useMutation({
    mutationFn: menuApi.deleteMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuTree'] });
    },
  });

  // 切换菜单展开状态
  const toggleExpanded = (menuId: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId);
    } else {
      newExpanded.add(menuId);
    }
    setExpandedMenus(newExpanded);
  };

  // 渲染菜单树
  const renderMenuTree = (menus: MenuTreeNode[], level = 0) => {
    return menus.map((menu) => {
      const hasChildren = menu.children && menu.children.length > 0;
      const isExpanded = expandedMenus.has(menu.id);

      return (
        <div key={menu.id} className="border-l-2 border-gray-200 ml-4">
          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md">
            <div className="flex items-center space-x-3">
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpanded(menu.id)}
                  className="p-1 h-6 w-6"
                >
                  {isExpanded ? '−' : '+'}
                </Button>
              )}
              {!hasChildren && <div className="w-6" />}
              
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{menu.name}</span>
                  {menu.is_system && (
                    <Badge variant="secondary" className="text-xs">
                      系统
                    </Badge>
                  )}
                  {!menu.visible && <EyeOff className="h-4 w-4 text-gray-400" />}
                </div>
                {menu.path && (
                  <span className="text-sm text-gray-500">{menu.path}</span>
                )}
                {menu.description && (
                  <span className="text-xs text-gray-400 block">
                    {menu.description}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <PermissionButton
                permission="menu:update"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedMenu(menu);
                  setIsEditDialogOpen(true);
                }}
                disabled={menu.is_system}
              >
                <Edit className="h-4 w-4" />
              </PermissionButton>

              <PermissionButton
                permission="menu:delete"
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm(`确定要删除菜单"${menu.name}"吗？`)) {
                    deleteMenuMutation.mutate(menu.id);
                  }
                }}
                disabled={menu.is_system || hasChildren}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </PermissionButton>
            </div>
          </div>

          {hasChildren && isExpanded && (
            <div className="ml-4">
              {renderMenuTree(menu.children!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  if (isPending) {
    return <div className="p-6">加载中...</div>;
  }

  return (
    <PermissionGuard permission="menu:read" fallback={<div>无权限访问</div>}>
      <div className="container space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">菜单管理</h1>
            <p className="text-gray-600">管理系统菜单和权限</p>
          </div>

          <PermissionButton
            permission="menu:create"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            创建菜单
          </PermissionButton>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>菜单树</CardTitle>
            <CardDescription>
              系统中的所有菜单按层级显示。系统菜单无法编辑或删除。
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!menuTree || menuTree.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                暂无菜单数据
              </div>
            ) : (
              <div className="space-y-2">
                {renderMenuTree(menuTree)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 创建菜单对话框 */}
        <CreateMenuDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSubmit={(data) => createMenuMutation.mutate(data)}
          isPending={createMenuMutation.isPending}
        />

        {/* 编辑菜单对话框 */}
        {selectedMenu && (
          <EditMenuDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            menu={selectedMenu}
            onSubmit={(data) =>
              updateMenuMutation.mutate({ id: selectedMenu.id, data })
            }
            isPending={updateMenuMutation.isPending}
            menuTree={menuTree}
          />
        )}
      </div>
    </PermissionGuard>
  );
};

// 创建菜单对话框组件
interface CreateMenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateMenuRequest) => void;
  isPending: boolean;
}

const CreateMenuDialog: React.FC<CreateMenuDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}) => {
  const [formData, setFormData] = useState<CreateMenuRequest>({
    name: '',
    path: '',
    icon: '',
    component: '',
    sort: 0,
    visible: true,
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      path: '',
      icon: '',
      component: '',
      sort: 0,
      visible: true,
      description: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetForm();
    }}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>创建菜单</DialogTitle>
          <DialogDescription>
            创建新的菜单项。菜单将会在系统导航中显示。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">菜单名称 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="path">路由路径</Label>
              <Input
                id="path"
                value={formData.path}
                onChange={(e) =>
                  setFormData({ ...formData, path: e.target.value })
                }
                placeholder="/example"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="icon">图标</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                placeholder="icon-name"
              />
            </div>
            <div>
              <Label htmlFor="sort">排序</Label>
              <Input
                id="sort"
                type="number"
                value={formData.sort}
                onChange={(e) =>
                  setFormData({ ...formData, sort: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="component">组件路径</Label>
            <Input
              id="component"
              value={formData.component}
              onChange={(e) =>
                setFormData({ ...formData, component: e.target.value })
              }
              placeholder="pages/Example"
            />
          </div>

          <div>
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="visible"
              checked={formData.visible}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, visible: checked })
              }
            />
            <Label htmlFor="visible">显示菜单</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? '创建中...' : '创建'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// 编辑菜单对话框组件
interface EditMenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menu: MenuTreeNode;
  onSubmit: (data: UpdateMenuRequest) => void;
  isPending: boolean;
  menuTree: MenuTreeNode[];
}

const EditMenuDialog: React.FC<EditMenuDialogProps> = ({
  open,
  onOpenChange,
  menu,
  onSubmit,
  isPending,
}) => {
  const [formData, setFormData] = useState<UpdateMenuRequest>({
    name: menu.name,
    path: menu.path || '',
    icon: menu.icon || '',
    component: menu.component || '',
    sort: menu.sort,
    visible: menu.visible,
    description: menu.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>编辑菜单</DialogTitle>
          <DialogDescription>
            修改菜单信息。系统菜单的某些属性无法修改。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-name">菜单名称 *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                disabled={menu.is_system}
              />
            </div>
            <div>
              <Label htmlFor="edit-path">路由路径</Label>
              <Input
                id="edit-path"
                value={formData.path}
                onChange={(e) =>
                  setFormData({ ...formData, path: e.target.value })
                }
                disabled={menu.is_system}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-icon">图标</Label>
              <Input
                id="edit-icon"
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-sort">排序</Label>
              <Input
                id="edit-sort"
                type="number"
                value={formData.sort}
                onChange={(e) =>
                  setFormData({ ...formData, sort: parseInt(e.target.value) || 0 })
                }
              />
            </div>
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
              id="edit-visible"
              checked={formData.visible}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, visible: checked })
              }
            />
            <Label htmlFor="edit-visible">显示菜单</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? '保存中...' : '保存'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MenuManagement;