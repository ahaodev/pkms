import {useCallback} from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Button} from '@/components/ui/button';
import {useI18n} from '@/contexts/i18n-context';

interface TenantFormData {
    name: string;
}

interface TenantDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: () => void;
    title: string;
    isEdit?: boolean;
    tenantForm: TenantFormData;
    updateTenantForm: (updates: Partial<TenantFormData>) => void;
}

export function TenantDialog({
                                 open,
                                 onClose,
                                 onSubmit,
                                 title,
                                 isEdit = false,
                                 tenantForm,
                                 updateTenantForm
                             }: TenantDialogProps) {
    const { t } = useI18n();
    
    const handleOpenChange = useCallback((isOpen: boolean) => {
        if (!isOpen) {
            onClose();
        }
    }, [onClose]);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange} modal={true}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? t('tenant.editTenantInfo') : t('tenant.createNewTenant')}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name">{t('tenant.name')}</Label>
                        <Input
                            id="name"
                            value={tenantForm.name}
                            onChange={(e) => updateTenantForm({name: e.target.value})}
                            placeholder={t('tenant.namePlaceholder')}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        {t('common.cancel')}
                    </Button>
                    <Button onClick={onSubmit}>
                        {isEdit ? t('common.update') : t('common.create')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}