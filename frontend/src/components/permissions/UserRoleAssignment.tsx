import React, {useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import {Eye, Trash2, UserPlus, Users} from 'lucide-react';
import {toast} from 'sonner';
import {apiClient} from '@/lib/api/api';
import {useAuth} from '@/providers/auth-provider';
import {getRoleDisplayName} from '@/lib/utils/permission-utils';
import type {EnhancedRole, User, UserRoleForm} from '@/types';

interface UserRoleAssignmentProps {
    enhancedRoles: EnhancedRole[];
    users: User[];
    onRefresh: () => Promise<void>;
    onShowUserPermissions: (userId: string) => Promise<void>;
}

const UserRoleAssignment: React.FC<UserRoleAssignmentProps> = ({
                                                                   enhancedRoles,
                                                                   users,
                                                                   onRefresh,
                                                                   onShowUserPermissions
                                                               }) => {
    const {currentTenant} = useAuth();
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [formData, setFormData] = useState<UserRoleForm>({
        user_id: '',
        role: '',
        tenant: currentTenant?.id || ''
    });

    const predefinedRoles = ['pm', 'developer', 'viewer'];

    const handleAdd = async () => {
        if (!formData.user_id || !formData.role || !formData.tenant) {
            toast.error('请填写所有必填字段');
            return;
        }

        try {
            const response = await apiClient.post('/api/v1/casbin/roles', formData);
            if (response.data && response.data.code === 0) {
                toast.success('用户角色添加成功');
                setShowAddDialog(false);
                setFormData({
                    user_id: '',
                    role: '',
                    tenant: currentTenant?.id || ''
                });
                await onRefresh();
            } else {
                toast.error(response.data.msg || '添加用户角色失败');
            }
        } catch (error) {
            console.error('添加用户角色失败:', error);
            toast.error('添加用户角色失败');
        }
    };

    const handleRemove = async (userId: string, role: string, domain: string) => {
        try {
            const response = await apiClient.delete('/api/v1/casbin/roles', {
                data: {user_id: userId, role, tenant: domain}
            });
            if (response.data && response.data.code === 0) {
                toast.success('用户角色删除成功');
                await onRefresh();
            } else {
                toast.error(response.data.msg || '删除用户角色失败');
            }
        } catch (error) {
            console.error('删除用户角色失败:', error);
            toast.error('删除用户角色失败');
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5"/>
                        用户角色分配
                    </CardTitle>
                    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                        <DialogTrigger asChild>
                            <Button>
                                <UserPlus className="w-4 h-4 mr-2"/>
                                添加用户角色
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>添加用户角色</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="user_id">用户</Label>
                                    <Select
                                        value={formData.user_id}
                                        onValueChange={(value) => setFormData({
                                            ...formData,
                                            user_id: value
                                        })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="选择用户"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.map(user => (
                                                <SelectItem key={user.id} value={user.id}>
                                                    {user.name} ({user.id})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="tenant">租户</Label>
                                    <Select
                                        value={formData.tenant}
                                        onValueChange={(value) => setFormData({
                                            ...formData,
                                            tenant: value
                                        })}
                                        disabled={!currentTenant}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="选择租户"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currentTenant && (
                                                <SelectItem value={currentTenant.id}>
                                                    {currentTenant.name || currentTenant.id}
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="role">角色</Label>
                                    <Select
                                        value={formData.role}
                                        onValueChange={(value) => setFormData({
                                            ...formData,
                                            role: value
                                        })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="选择角色">
                                                {formData.role ? (
                                                    <span>{getRoleDisplayName(formData.role)} ({formData.role})</span>
                                                ) : (
                                                    "选择角色"
                                                )}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {predefinedRoles.map(role => (
                                                <SelectItem key={role} value={role}>
                                                    {getRoleDisplayName(role)} ({role})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleAdd} className="flex-1">
                                        添加
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowAddDialog(false)}
                                        className="flex-1"
                                    >
                                        取消
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>用户</TableHead>
                            <TableHead>租户</TableHead>
                            <TableHead>角色</TableHead>
                            <TableHead>操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {enhancedRoles.map((role, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span>{role.user}</span>
                                        {role.user_name && (
                                            <span className="text-sm text-muted-foreground">
                                                ({role.user_name})
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{role.domain_name || role.domain}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{getRoleDisplayName(role.role)}</Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onShowUserPermissions(role.user)}
                                        >
                                            <Eye className="w-4 h-4"/>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemove(role.user, role.role, role.domain)}
                                        >
                                            <Trash2 className="w-4 h-4"/>
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default UserRoleAssignment;