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
                        {isEdit ? '编辑租户信息' : '创建新租户'}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name">租户名称</Label>
                        <Input
                            id="name"
                            value={tenantForm.name}
                            onChange={(e) => updateTenantForm({name: e.target.value})}
                            placeholder="输入租户名称"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        取消
                    </Button>
                    <Button onClick={onSubmit}>
                        {isEdit ? '更新' : '创建'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}