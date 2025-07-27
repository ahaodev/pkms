import { useState } from 'react';
import { 
  ClientAccessHeader,
  ClientAccessFilters,
  ClientAccessList,
  ClientAccessDialog,
  TokenDisplayDialog
} from '@/components/client-access';
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
import type { 
  ClientAccess, 
  ClientAccessFilters as Filters,
  CreateClientAccessRequest,
  UpdateClientAccessRequest
} from '@/types/client-access';

export default function ClientAccessPage() {
  // 状态管理
  const [filters, setFilters] = useState<Filters>({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingClientAccess, setEditingClientAccess] = useState<ClientAccess | undefined>();
  const [viewingToken, setViewingToken] = useState<ClientAccess | null>(null);

  // API hooks
  const { 
    data: clientAccesses = [], 
    isLoading, 
    error 
  } = useClientAccessList(filters);
  
  const createMutation = useCreateClientAccess();
  const updateMutation = useUpdateClientAccess();
  const deleteMutation = useDeleteClientAccess();
  const toggleStatusMutation = useToggleClientAccessStatus();
  const regenerateTokenMutation = useRegenerateToken();

  // 事件处理
  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
  };

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
      <div className="container mx-auto py-8 space-y-6">
        <ClientAccessHeader onCreateClick={handleCreateClick} />
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            加载设备接入管理数据时出错: {String(error) || '未知错误'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* 页面标题 */}
      <ClientAccessHeader onCreateClick={handleCreateClick} />

      {/* 筛选组件 */}
      <ClientAccessFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
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