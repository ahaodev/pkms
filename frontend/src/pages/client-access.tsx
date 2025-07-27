import { useState, useMemo, useEffect } from 'react';
import { 
  ClientAccessHeader,
  ClientAccessList,
  ClientAccessDialog,
  TokenDisplayDialog
} from '@/components/client-access';
import { ProjectPackageFilters } from '@/components/shared';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { 
  useClientAccessList,
  useCreateClientAccess,
  useUpdateClientAccess,
  useDeleteClientAccess,
  useToggleClientAccessStatus,
  useRegenerateToken
} from '@/hooks/use-client-access';
import { useProjects } from '@/hooks/use-projects';
import { usePackages } from '@/hooks/use-packages';
import type { 
  ClientAccess, 
  ClientAccessFilters as Filters,
  CreateClientAccessRequest,
  UpdateClientAccessRequest
} from '@/types/client-access';

export default function ClientAccessPage() {
  // 筛选状态管理 - 改为与升级管理页面一致的格式
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [packageFilter, setPackageFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingClientAccess, setEditingClientAccess] = useState<ClientAccess | undefined>();
  const [viewingToken, setViewingToken] = useState<ClientAccess | null>(null);

  // 基础数据
  const { data: projects = [] } = useProjects();
  const { data: packagesData } = usePackages();
  const packages = packagesData?.data || [];

  // 构建旧格式的筛选条件给API使用
  const filters = useMemo<Filters>(() => ({
    project_id: projectFilter === 'all' ? undefined : projectFilter,
    package_id: packageFilter === 'all' ? undefined : packageFilter,
  }), [projectFilter, packageFilter]);

  // 当项目筛选改变时重置包筛选
  useEffect(() => {
    if (projectFilter !== 'all') {
      setPackageFilter('all');
    }
  }, [projectFilter]);

  // API hooks
  const { 
    data: clientAccesses, 
    isLoading, 
    error 
  } = useClientAccessList(filters);
  
  const createMutation = useCreateClientAccess();
  const updateMutation = useUpdateClientAccess();
  const deleteMutation = useDeleteClientAccess();
  const toggleStatusMutation = useToggleClientAccessStatus();
  const regenerateTokenMutation = useRegenerateToken();

  // 获取总数用于显示
  const totalCount = clientAccesses?.length || 0;

  const handleCreateClick = () => {
    setShowCreateDialog(true);
  };

  const handleEdit = (clientAccess: ClientAccess) => {
    setEditingClientAccess(clientAccess);
  };

  const handleViewToken = (clientAccess: ClientAccess) => {
    setViewingToken(clientAccess);
  };

  const handleCreate = async (data: CreateClientAccessRequest) => {
    await createMutation.mutateAsync(data);
  };

  const handleUpdate = async (data: UpdateClientAccessRequest) => {
    if (!editingClientAccess) return;
    await updateMutation.mutateAsync({
      id: editingClientAccess.id,
      data,
    });
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    await toggleStatusMutation.mutateAsync({ id, isActive });
  };

  const handleRegenerateToken = async (id: string) => {
    await regenerateTokenMutation.mutateAsync(id);
  };

  // 错误处理
  if (error) {
    return (
      <div className="space-y-6">
        <ClientAccessHeader onCreateClick={handleCreateClick} />
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            加载接入管理数据时出错: {String(error) || '未知错误'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <ClientAccessHeader onCreateClick={handleCreateClick} />

      {/* 筛选组件 */}
      <ProjectPackageFilters
        projectFilter={projectFilter}
        packageFilter={packageFilter}
        totalCount={totalCount}
        countLabel="个接入配置"
        projects={projects}
        packages={packages}
        onProjectFilterChange={setProjectFilter}
        onPackageFilterChange={setPackageFilter}
      />

      {/* 列表组件 */}
      <ClientAccessList
        clientAccesses={clientAccesses}
        loading={isLoading}
        error={error ? String(error) : undefined}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        onRegenerateToken={handleRegenerateToken}
        onViewToken={handleViewToken}
      />

      {/* 创建/编辑对话框 */}
      <ClientAccessDialog
        open={showCreateDialog || !!editingClientAccess}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingClientAccess(undefined);
          }
        }}
        clientAccess={editingClientAccess}
        onSubmit={editingClientAccess 
          ? (data) => handleUpdate(data as UpdateClientAccessRequest)
          : (data) => handleCreate(data as CreateClientAccessRequest)
        }
        loading={createMutation.isPending || updateMutation.isPending}
      />

      {/* 令牌显示对话框 */}
      <TokenDisplayDialog
        open={!!viewingToken}
        onOpenChange={(open) => !open && setViewingToken(null)}
        clientAccess={viewingToken}
      />
    </div>
  );
}