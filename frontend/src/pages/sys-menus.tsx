// Menu管理页面

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { menuApi } from '@/lib/api/menu';
import { PermissionButton, PermissionGuard } from '@/components/permissions/permission-guard';
import { Page, PageHeader, PageContent } from '@/components/page';
import { CreateMenuDialog, EditMenuDialog, MenuTree } from '@/components/sys-menu';
import type { MenuTreeNode, CreateMenuRequest, UpdateMenuRequest } from '@/types/menu';

const MenuManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuTreeNode | null>(null);

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

  const handleEditMenu = (menu: MenuTreeNode) => {
    setSelectedMenu(menu);
    setIsEditDialogOpen(true);
  };

  const handleDeleteMenu = (menuId: string, menuName: string) => {
    if (confirm(`确定要删除菜单"${menuName}"吗？`)) {
      deleteMenuMutation.mutate(menuId);
    }
  };

  return (
    <PermissionGuard 
      permission="menu:read"
      fallback={<div className="text-center py-8 text-muted-foreground">无权限访问</div>}
    >
      <Page isLoading={isPending}>
        <PageHeader
          title="菜单管理"
          description="管理系统菜单和权限"
        />
        
        {/* 带权限控制的创建按钮 */}
        <div className="flex justify-end">
          <PermissionButton
            permission="menu:create"
            onClick={() => setIsCreateDialogOpen(true)}
            variant="default"
          >
            <Plus className="h-4 w-4 mr-2" />
            创建菜单
          </PermissionButton>
        </div>
        
        <PageContent>
          <MenuTree
            menuTree={menuTree}
            onEdit={handleEditMenu}
            onDelete={handleDeleteMenu}
            isLoading={isPending}
          />

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
        </PageContent>
      </Page>
    </PermissionGuard>
  );
};


export default MenuManagement;