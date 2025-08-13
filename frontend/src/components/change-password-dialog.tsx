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

interface ChangePasswordDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({open, onOpenChange}: ChangePasswordDialogProps) {
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
            toast.error("请填写所有字段");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("新密码和确认密码不匹配");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("新密码长度至少为6位");
            return;
        }

        setLoading(true);
        try {
            await updateUserPassword({
                current_password: currentPassword,
                new_password: newPassword,
            });
            
            toast.success("密码修改成功");
            onOpenChange(false);
            // 表单将通过useEffect自动清除
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "密码修改失败，请稍后重试";
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
                    <DialogTitle>更改密码</DialogTitle>
                    <DialogDescription>
                        请输入当前密码和新密码来更改您的登录密码
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="current-password">当前密码</Label>
                        <Input
                            id="current-password"
                            type="password"
                            placeholder="请输入当前密码"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                    </div>
                    
                    <div className="grid gap-2">
                        <Label htmlFor="new-password">新密码</Label>
                        <Input
                            id="new-password"
                            type="password"
                            placeholder="请输入新密码（至少6位）"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    
                    <div className="grid gap-2">
                        <Label htmlFor="confirm-password">确认新密码</Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            placeholder="请再次输入新密码"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                </div>
                
                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel} disabled={loading}>
                        取消
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "正在修改..." : "确认修改"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}