import { ClientAccessCard } from './client-access-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package } from 'lucide-react';
import type { ClientAccess } from '@/types/client-access';

interface ClientAccessListProps {
  clientAccesses: ClientAccess[] | null | undefined;
  loading?: boolean;
  error?: string;
  onEdit: (clientAccess: ClientAccess) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onRegenerateToken: (id: string) => void;
  onViewToken: (clientAccess: ClientAccess) => void;
}

export function ClientAccessList({
  clientAccesses,
  loading,
  error,
  onEdit,
  onDelete,
  onToggleStatus,
  onRegenerateToken,
  onViewToken,
}: ClientAccessListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Package className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // 处理 null/undefined 或空数组的情况
  if (!clientAccesses || clientAccesses.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">暂无设备接入凭证</h3>
        <p className="mt-2 text-muted-foreground">
          创建第一个接入凭证来允许客户端设备访问升级服务
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clientAccesses.map((clientAccess) => (
        <ClientAccessCard
          key={clientAccess.id}
          clientAccess={clientAccess}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
          onRegenerateToken={onRegenerateToken}
          onViewToken={onViewToken}
        />
      ))}
    </div>
  );
}