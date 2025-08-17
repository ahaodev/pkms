import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, EyeOff } from 'lucide-react';
import { PermissionButton } from '@/components/permissions/permission-guard';
import type { MenuTreeNode } from '@/types/menu';

interface MenuTreeProps {
  menuTree: MenuTreeNode[];
  onEdit: (menu: MenuTreeNode) => void;
  onDelete: (menuId: string, menuName: string) => void;
  isLoading?: boolean;
}

export const MenuTree: React.FC<MenuTreeProps> = ({
  menuTree,
  onEdit,
  onDelete,
  isLoading,
}) => {
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  const toggleExpanded = (menuId: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId);
    } else {
      newExpanded.add(menuId);
    }
    setExpandedMenus(newExpanded);
  };

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
                onClick={() => onEdit(menu)}
                disabled={menu.is_system}
              >
                <Edit className="h-4 w-4" />
              </PermissionButton>

              <PermissionButton
                permission="menu:delete"
                variant="ghost"
                size="sm"
                onClick={() => onDelete(menu.id, menu.name)}
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

  return (
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
  );
};