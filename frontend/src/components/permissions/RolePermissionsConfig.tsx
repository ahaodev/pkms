import React, {useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import {Key, Plus, Trash2} from 'lucide-react';
import {toast} from 'sonner';
import {apiClient} from '@/lib/api/api';
import {useAuth} from '@/providers/auth-provider';
import {getActionDisplayName, getObjectDisplayName, getRoleDisplayName} from '@/lib/utils/permission-utils';
import type {EnhancedPolicy, RolePolicyForm} from '@/types';
import {ASSIGNABLE_ROLES} from '@/types';

interface RolePermissionsConfigProps {
    enhancedPolicies: EnhancedPolicy[];
    objects: string[];
    actions: string[];
    onRefresh: () => Promise<void>;
}

const RolePermissionsConfig: React.FC<RolePermissionsConfigProps> = ({
                                                                         enhancedPolicies,
                                                                         objects,
                                                                         actions,
                                                                         onRefresh
                                                                     }) => {
    const {currentTenant} = useAuth();
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [formData, setFormData] = useState<RolePolicyForm>({
        role: '',
        tenant: currentTenant?.id || '',
        object: '',
        action: ''
    });

    const assignableRoles = [...ASSIGNABLE_ROLES];

    const rolePolicies = enhancedPolicies.filter(policy =>
        (assignableRoles as readonly string[]).includes(policy.subject) && policy.subject !== 'admin'
    );

    const handleAdd = async () => {
        if (!formData.role || !formData.tenant || !formData.object || !formData.action) {
            toast.error('请填写所有必填字段');
            return;
        }

        try {
            const response = await apiClient.post('/api/v1/casbin/role-policies', formData);
            if (response.data && response.data.code === 0) {
                toast.success('角色权限添加成功');
                setShowAddDialog(false);
                setFormData({
                    role: '',
                    tenant: currentTenant?.id || '',
                    object: '',
                    action: ''
                });
                await onRefresh();
            } else {
                toast.error(response.data.msg || '添加角色权限失败');
            }
        } catch (error) {
            console.error('添加角色权限失败:', error);
            toast.error('添加角色权限失败');
        }
    };

    const handleRemove = async (role: string, domain: string, object: string, action: string) => {
        try {
            const response = await apiClient.delete('/api/v1/casbin/role-policies', {
                data: {role, tenant: domain, object, action}
            });
            if (response.data && response.data.code === 0) {
                toast.success('角色权限删除成功');
                await onRefresh();
            } else {
                toast.error(response.data.msg || '删除角色权限失败');
            }
        } catch (error) {
            console.error('删除角色权限失败:', error);
            toast.error('删除角色权限失败');
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                        <Key className="w-5 h-5"/>
                        角色权限配置
                    </CardTitle>
                    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2"/>
                                添加角色权限
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>添加角色权限</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
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
                                            {assignableRoles.map(role => (
                                                <SelectItem key={role} value={role}>
                                                    {getRoleDisplayName(role)} ({role})
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
                                    <Label htmlFor="object">对象</Label>
                                    <Select
                                        value={formData.object}
                                        onValueChange={(value) => setFormData({
                                            ...formData,
                                            object: value
                                        })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="选择对象">
                                                {formData.object ? (
                                                    <span>{getObjectDisplayName(formData.object)} ({formData.object})</span>
                                                ) : (
                                                    "选择对象"
                                                )}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {objects.map(obj => (
                                                <SelectItem key={obj} value={obj}>
                                                    {getObjectDisplayName(obj)} ({obj})
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
                                            <SelectValue placeholder="选择操作">
                                                {formData.action ? (
                                                    <span>{getActionDisplayName(formData.action)} ({formData.action})</span>
                                                ) : (
                                                    "选择操作"
                                                )}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {actions.map(action => (
                                                <SelectItem key={action} value={action}>
                                                    {getActionDisplayName(action)} ({action})
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
                            <TableHead>角色</TableHead>
                            <TableHead>租户</TableHead>
                            <TableHead>对象</TableHead>
                            <TableHead>操作</TableHead>
                            <TableHead>操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rolePolicies.map((policy, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <Badge variant="secondary">{getRoleDisplayName(policy.subject)}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{policy.domain_name || policy.domain}</Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{getObjectDisplayName(policy.object)}</span>
                                        <span className="text-xs text-muted-foreground">({policy.object})</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{getActionDisplayName(policy.action)}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemove(policy.subject, policy.domain, policy.object, policy.action)}
                                    >
                                        <Trash2 className="w-4 h-4"/>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default RolePermissionsConfig;