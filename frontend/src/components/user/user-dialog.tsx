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

interface UserFormData {
    name: string;
    password: string;
    is_active: boolean;
}

interface UserDialogProps {
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
    const handleOpenChange = useCallback((isOpen: boolean) => {
        if (!isOpen) {
            onClose();
        }
    }, [onClose]);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? '编辑用户基本信息' : '创建新用户'}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name">用户名</Label>
                        <Input
                            id="name"
                            value={userForm.name}
                            onChange={(e) => updateUserForm({name: e.target.value})}
                            placeholder="输入用户名"
                        />
                    </div>

                    {!isEdit && (
                        <div>
                            <Label htmlFor="password">密码</Label>
                            <Input
                                id="password"
                                type="password"
                                value={userForm.password}
                                onChange={(e) => updateUserForm({password: e.target.value})}
                                placeholder="输入密码"
                            />
                        </div>
                    )}

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="is_active"
                            checked={userForm.is_active}
                            onCheckedChange={(checked) => updateUserForm({is_active: checked})}
                        />
                        <Label htmlFor="is_active">启用用户</Label>
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