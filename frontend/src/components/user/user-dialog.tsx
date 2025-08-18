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
import {Switch} from '@/components/ui/switch';
import {Button} from '@/components/ui/button';
import {Project} from '@/types/project';
import {Group} from '@/types/group';
import {useI18n} from '@/contexts/i18n-context';

interface UserFormData {
    name: string;
    password: string;
    is_active: boolean;
    create_tenant: boolean;
}

export interface UserDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: () => void;
    title: string;
    isEdit?: boolean;
    userForm: UserFormData;
    projects?: Project[];
    groups?: Group[];
    updateUserForm: (updates: Partial<UserFormData>) => void;
}

export function UserDialog({
                               open,
                               onClose,
                               onSubmit,
                               title,
                               isEdit = false,
                               userForm,
                               updateUserForm
                           }: UserDialogProps) {
    const { t } = useI18n();
    const handleOpenChange = useCallback((isOpen: boolean) => {
        if (!isOpen) {
            onClose();
        }
    }, [onClose]);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange} modal={true}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? t('user.editUserInfo') : t('user.createNew')}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name">{t('user.name')}</Label>
                        <Input
                            id="name"
                            value={userForm.name}
                            onChange={(e) => updateUserForm({name: e.target.value})}
                            placeholder={t('user.namePlaceholder')}
                        />
                    </div>

                    {!isEdit ? (
                        <div>
                            <Label htmlFor="password">{t('user.password')}</Label>
                            <Input
                                id="password"
                                type="password"
                                value={userForm.password}
                                onChange={(e) => updateUserForm({password: e.target.value})}
                                placeholder={t('user.passwordPlaceholder')}
                            />
                        </div>
                    ) : (
                        <div>
                            <Label htmlFor="password">{t('user.newPasswordOptional')}</Label>
                            <Input
                                id="password"
                                type="password"
                                value={userForm.password}
                                onChange={(e) => updateUserForm({password: e.target.value})}
                                placeholder={t('user.leaveEmptyToKeepPassword')}
                            />
                            <p className="text-sm text-muted-foreground mt-1">
                                {t('user.passwordChangeHint')}
                            </p>
                        </div>
                    )}

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="is_active"
                            checked={userForm.is_active}
                            onCheckedChange={(checked) => updateUserForm({is_active: checked})}
                        />
                        <Label htmlFor="is_active">{t('user.enableUser')}</Label>
                    </div>

                    {!isEdit && (
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="create_tenant"
                                checked={userForm.create_tenant}
                                onCheckedChange={(checked) => updateUserForm({create_tenant: checked})}
                            />
                            <Label htmlFor="create_tenant">{t('user.createCorrespondingTenant')}</Label>
                        </div>
                    )}

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