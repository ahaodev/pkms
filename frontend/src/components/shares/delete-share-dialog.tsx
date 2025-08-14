import {memo} from 'react';
import { useI18n } from '@/contexts/i18n-context';
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
    const { t } = useI18n();
    
    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('share.confirmDelete')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('share.deleteShareWarning')}
                        {shareToDelete && (
                            <div className="mt-2 p-2 bg-muted rounded text-sm">
                                <p><strong>{t('project.name')}:</strong> {shareToDelete.project_name}</p>
                                <p><strong>{t('package.name')}:</strong> {shareToDelete.package_name}</p>
                                <p><strong>{t('release.version')}:</strong> {shareToDelete.version}</p>
                                <p><strong>{t('share.shareCode')}:</strong> {shareToDelete.code}</p>
                            </div>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={isDeleting}
                    >
                        {isDeleting ? t('common.deleting') : t('share.confirmDelete')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
});