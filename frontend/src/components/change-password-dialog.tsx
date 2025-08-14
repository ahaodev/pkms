import {useState, useEffect} from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {toast} from 'sonner';
import {updateUserPassword} from '@/lib/api/users';
import {useI18n} from '@/contexts/i18n-context';

interface ChangePasswordDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({open, onOpenChange}: ChangePasswordDialogProps) {
    const { t } = useI18n();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // 清除表单状态
    const clearForm = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setLoading(false);
    };

    // 当弹窗关闭时清除表单
    useEffect(() => {
        if (!open) {
            // 延迟清除表单，确保关闭动画完成
            const timer = setTimeout(clearForm, 150);
            return () => clearTimeout(timer);
        }
    }, [open]);

    const handleSubmit = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error(t('auth.allFieldsRequired'));
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error(t('auth.passwordMismatch'));
            return;
        }

        if (newPassword.length < 6) {
            toast.error(t('auth.passwordMinLength'));
            return;
        }

        setLoading(true);
        try {
            await updateUserPassword({
                current_password: currentPassword,
                new_password: newPassword,
            });
            
            toast.success(t('auth.passwordChangeSuccess'));
            onOpenChange(false);
            // 表单将通过useEffect自动清除
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || t('auth.passwordChangeError');
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        onOpenChange(false);
        // 表单将通过useEffect自动清除
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
            <DialogContent 
                className="sm:max-w-[425px]"
                onEscapeKeyDown={() => onOpenChange(false)}
                onPointerDownOutside={() => onOpenChange(false)}
            >
                <DialogHeader>
                    <DialogTitle>{t('auth.changePassword')}</DialogTitle>
                    <DialogDescription>
                        {t('auth.changePasswordDescription')}
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="current-password">{t('auth.currentPassword')}</Label>
                        <Input
                            id="current-password"
                            type="password"
                            placeholder={t('auth.currentPasswordPlaceholder')}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                    </div>
                    
                    <div className="grid gap-2">
                        <Label htmlFor="new-password">{t('auth.newPassword')}</Label>
                        <Input
                            id="new-password"
                            type="password"
                            placeholder={t('auth.newPasswordPlaceholder')}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    
                    <div className="grid gap-2">
                        <Label htmlFor="confirm-password">{t('auth.confirmNewPassword')}</Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            placeholder={t('auth.confirmPasswordPlaceholder')}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                </div>
                
                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel} disabled={loading}>
                        {t('common.cancel')}
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? t('auth.changing') : t('auth.confirmModify')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}