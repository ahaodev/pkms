import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import type { MenuTreeNode, UpdateMenuRequest } from '@/types/menu';

interface EditMenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menu: MenuTreeNode;
  onSubmit: (data: UpdateMenuRequest) => void;
  isPending: boolean;
  menuTree: MenuTreeNode[];
}

export const EditMenuDialog: React.FC<EditMenuDialogProps> = ({
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