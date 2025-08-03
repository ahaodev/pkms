import {memo} from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {ShareListItem} from '@/lib/api/shares';

interface DeleteShareDialogProps {
    isOpen: boolean;
    shareToDelete: ShareListItem | null;
    isDeleting: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const DeleteShareDialog = memo(function DeleteShareDialog({
    isOpen,
    shareToDelete,
    isDeleting,
    onClose,
    onConfirm,
}: DeleteShareDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>确认删除</AlertDialogTitle>
                    <AlertDialogDescription>
                        确定要删除这个分享链接吗？删除后，使用此链接的用户将无法再下载文件。
                        {shareToDelete && (
                            <div className="mt-2 p-2 bg-muted rounded text-sm">
                                <p><strong>项目:</strong> {shareToDelete.project_name}</p>
                                <p><strong>包:</strong> {shareToDelete.package_name}</p>
                                <p><strong>版本:</strong> {shareToDelete.version}</p>
                                <p><strong>分享码:</strong> {shareToDelete.code}</p>
                            </div>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={isDeleting}
                    >
                        {isDeleting ? '删除中...' : '确认删除'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
});