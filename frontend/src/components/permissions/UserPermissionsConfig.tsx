import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Plus, Shield, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api/api';
import { useAuth } from '@/providers/auth-provider';
import type { EnhancedPolicy, User, UserPolicyForm } from '@/types';

interface UserPermissionsConfigProps {
    enhancedPolicies: EnhancedPolicy[];
    users: User[];
    objects: string[];
    actions: string[];
    onRefresh: () => Promise<void>;
    onShowUserPermissions: (userId: string) => Promise<void>;
}

const UserPermissionsConfig: React.FC<UserPermissionsConfigProps> = ({
    enhancedPolicies,
    users,
    objects,
    actions,
    onRefresh,
    onShowUserPermissions
}) => {
    const { currentTenant } = useAuth();
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [formData, setFormData] = useState<UserPolicyForm>({
        user_id: '',
        tenant: currentTenant?.id || '',
        object: '',
        action: ''
    });

    const predefinedRoles = ['pm', 'developer', 'viewer'];

    // Filter out role policies to show only user policies
    const userPolicies = enhancedPolicies.filter(policy => 
        !predefinedRoles.includes(policy.subject)
    );

    const handleAdd = async () => {
        if (!formData.user_id || !formData.tenant || !formData.object || !formData.action) {
            toast.error('请填写所有必填字段');
            return;
        }

        try {
            const response = await apiClient.post('/api/v1/casbin/policies', formData);
            if (response.data && response.data.code === 0) {
                toast.success('用户权限添加成功');
                setShowAddDialog(false);
                setFormData({ 
                    user_id: '',
                    tenant: currentTenant?.id || '', 
                    object: '', 
                    action: '' 
                });
                await onRefresh();
            } else {
                toast.error(response.data.msg || '添加用户权限失败');
            }
        } catch (error) {
            console.error('添加用户权限失败:', error);
            toast.error('添加用户权限失败');
        }
    };

    const handleRemove = async (userId: string, domain: string, object: string, action: string) => {
        try {
            const response = await apiClient.delete('/api/v1/casbin/policies', {
                data: { user_id: userId, tenant: domain, object, action }
            });
            if (response.data && response.data.code === 0) {
                toast.success('用户权限删除成功');
                await onRefresh();
            } else {
                toast.error(response.data.msg || '删除用户权限失败');
            }
        } catch (error) {
            console.error('删除用户权限失败:', error);
            toast.error('删除用户权限失败');
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        用户权限配置
                    </CardTitle>
                    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                添加用户权限
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>添加用户权限</DialogTitle>
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
                                            <SelectValue placeholder="选择用户" />
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
                                            <SelectValue placeholder="选择租户" />
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
                                    <Label htmlFor="object">对象</Label>
                                    <Select 
                                        value={formData.object}
                                        onValueChange={(value) => setFormData({
                                            ...formData,
                                            object: value
                                        })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="选择对象" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {objects.map(obj => (
                                                <SelectItem key={obj} value={obj}>
                                                    {obj}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="action">操作</Label>
                                    <Select 
                                        value={formData.action}
                                        onValueChange={(value) => setFormData({
                                            ...formData,
                                            action: value
                                        })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="选择操作" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {actions.map(action => (
                                                <SelectItem key={action} value={action}>
                                                    {action}
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
                            <TableHead>对象</TableHead>
                            <TableHead>操作</TableHead>
                            <TableHead>操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {userPolicies.map((policy, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span>{policy.subject}</span>
                                        {policy.subject_name && (
                                            <span className="text-sm text-muted-foreground">
                                                ({policy.subject_name})
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{policy.domain_name || policy.domain}</Badge>
                                </TableCell>
                                <TableCell>{policy.object}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{policy.action}</Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onShowUserPermissions(policy.subject)}
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemove(policy.subject, policy.domain, policy.object, policy.action)}
                                        >
                                            <Trash2 className="w-4 h-4" />
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

export default UserPermissionsConfig;