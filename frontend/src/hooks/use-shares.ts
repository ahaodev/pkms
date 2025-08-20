import {useCallback, useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {ShareListItem, sharesApi} from '@/lib/api/shares';
import {useToast} from '@/hooks/use-toast';


interface DialogState {
    deleteOpen: boolean;
    viewOpen: boolean;
    editOpen: boolean;
    shareToDelete: ShareListItem | null;
    shareToView: ShareListItem | null;
    shareToEdit: ShareListItem | null;
}

export function useSharesWithPagination(page: number = 1, pageSize: number = 20) {
    const {toast} = useToast();
    const queryClient = useQueryClient();

    const {data: paginatedData, isLoading, error} = useQuery({
        queryKey: ['shares', 'paginated', page, pageSize],
        queryFn: () => sharesApi.getShares(page, pageSize),
    });

    return {
        paginatedData,
        isLoading,
        error,
        deleteMutation: createDeleteMutation(queryClient, toast),
    };
}

// 提取 delete mutation 创建逻辑
function createDeleteMutation(queryClient: any, toast: any) {
    return useMutation({
        mutationFn: sharesApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['shares']});
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
}

export function useShareDialogs() {
    const [dialogState, setDialogState] = useState<DialogState>({
        deleteOpen: false,
        viewOpen: false,
        editOpen: false,
        shareToDelete: null,
        shareToView: null,
        shareToEdit: null,
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

    const handleEditClick = useCallback((share: ShareListItem) => {
        setDialogState(prev => ({
            ...prev,
            editOpen: true,
            shareToEdit: share,
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

    const closeEditDialog = useCallback(() => {
        setDialogState(prev => ({
            ...prev,
            editOpen: false,
            shareToEdit: null,
        }));
    }, []);

    return {
        dialogState,
        handleDeleteClick,
        handleViewClick,
        handleEditClick,
        closeDeleteDialog,
        closeViewDialog,
        closeEditDialog,
    };
}