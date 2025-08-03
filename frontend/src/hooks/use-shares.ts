import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShareListItem, sharesApi } from '@/lib/api/shares';
import { useToast } from '@/hooks/use-toast';

interface ShareFilters {
  project: string;
  package: string;
}

interface DialogState {
  deleteOpen: boolean;
  viewOpen: boolean;
  shareToDelete: ShareListItem | null;
  shareToView: ShareListItem | null;
}

interface Project {
  id: string;
  name: string;
}

interface Package {
  id: string;
  name: string;
}

export function useShares() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: shares, isLoading, error } = useQuery({
    queryKey: ['shares'],
    queryFn: sharesApi.getAll,
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: sharesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shares'] });
      toast({
        title: '删除成功',
        description: '分享链接已删除',
      });
    },
    onError: (error: any) => {
      toast({
        title: '删除失败',
        description: error.response?.data?.message || '删除分享链接时发生错误',
        variant: 'destructive',
      });
    },
  });

  return {
    shares,
    isLoading,
    error,
    deleteMutation,
  };
}

export function useShareFilters(
  shares: ShareListItem[] | undefined,
  projects: Project[],
  packages: Package[]
) {
  const [filters, setFilters] = useState<ShareFilters>({
    project: 'all',
    package: 'all',
  });

  const updateProjectFilter = useCallback((projectId: string) => {
    setFilters(prev => ({
      project: projectId,
      package: projectId !== 'all' ? 'all' : prev.package,
    }));
  }, []);

  const updatePackageFilter = useCallback((packageId: string) => {
    setFilters(prev => ({ ...prev, package: packageId }));
  }, []);

  const filteredShares = useMemo(() => {
    if (!shares) return undefined;

    return shares.filter(share => {
      if (filters.project !== 'all') {
        const selectedProject = projects.find(p => p.id === filters.project);
        if (!selectedProject || share.project_name !== selectedProject.name) {
          return false;
        }
      }

      if (filters.package !== 'all') {
        const selectedPackage = packages.find(p => p.id === filters.package);
        if (!selectedPackage || share.package_name !== selectedPackage.name) {
          return false;
        }
      }

      return true;
    });
  }, [shares, filters.project, filters.package, projects, packages]);

  return {
    filters,
    filteredShares,
    updateProjectFilter,
    updatePackageFilter,
    totalCount: filteredShares?.length || 0,
  };
}

export function useShareDialogs() {
  const [dialogState, setDialogState] = useState<DialogState>({
    deleteOpen: false,
    viewOpen: false,
    shareToDelete: null,
    shareToView: null,
  });

  const handleDeleteClick = useCallback((share: ShareListItem) => {
    setDialogState(prev => ({
      ...prev,
      deleteOpen: true,
      shareToDelete: share,
    }));
  }, []);

  const handleViewClick = useCallback((share: ShareListItem) => {
    setDialogState(prev => ({
      ...prev,
      viewOpen: true,
      shareToView: share,
    }));
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDialogState(prev => ({
      ...prev,
      deleteOpen: false,
      shareToDelete: null,
    }));
  }, []);

  const closeViewDialog = useCallback(() => {
    setDialogState(prev => ({
      ...prev,
      viewOpen: false,
      shareToView: null,
    }));
  }, []);

  return {
    dialogState,
    handleDeleteClick,
    handleViewClick,
    closeDeleteDialog,
    closeViewDialog,
  };
}