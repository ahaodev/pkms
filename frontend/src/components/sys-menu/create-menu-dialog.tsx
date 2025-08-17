import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import type { CreateMenuRequest } from '@/types/menu';

interface CreateMenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateMenuRequest) => void;
  isPending: boolean;
}

export const CreateMenuDialog: React.FC<CreateMenuDialogProps> = ({
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