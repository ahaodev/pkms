import React, {useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import {Key, Plus, Trash2} from 'lucide-react';
import {useTenants} from '@/hooks/use-tenants';
import {usePermissionOperations} from '@/hooks/use-permission-operations';
import {validateRolePermissionForm} from '@/utils/permission-validation';
import {getActionDisplayName, getObjectDisplayName, getRoleDisplayName} from '@/lib/utils/permission-utils';
import type {EnhancedPolicy, RolePolicyForm} from '@/types';
import {ASSIGNABLE_ROLES} from '@/types';

interface RoleManagementProps {
    enhancedPolicies: EnhancedPolicy[];
    objects: string[];
    actions: string[];
    onRefresh: () => Promise<void>;
}

const RoleManagement: React.FC<RoleManagementProps> = ({
    enhancedPolicies,
    objects,
    actions,
    onRefresh
}) => {
    const {data: tenants = []} = useTenants();
    const {rolePermissions} = usePermissionOperations();
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [formData, setFormData] = useState<RolePolicyForm>({
        role: '',
        tenant: '',
        object: '',
        action: ''
    });

    const assignableRoles = [...ASSIGNABLE_ROLES];

    // 过滤出角色权限策略（排除admin和直接用户权限）
    const rolePolicies = enhancedPolicies.filter(policy =>
        (assignableRoles as readonly string[]).includes(policy.subject) && policy.subject !== 'admin'
    );

    const handleAdd = async () => {
        const validation = validateRolePermissionForm(formData);
        if (!validation.isValid) {
            return;
        }

        const success = await rolePermissions.add(formData, onRefresh);
        if (success) {
            setShowAddDialog(false);
            setFormData({
                role: '',
                tenant: '',
                object: '',
                action: ''
            });
        }
    };

    const handleRemove = async (role: string, domain: string, object: string, action: string) => {
        await rolePermissions.remove(role, domain, object, action, onRefresh);
    };

    // 按租户分组显示角色权限
    const groupedPolicies = rolePolicies.reduce((acc, policy) => {
        const tenantKey = policy.domain;
        if (!acc[tenantKey]) {
            acc[tenantKey] = [];
        }
        acc[tenantKey].push(policy);
        return acc;
    }, {} as Record<string, EnhancedPolicy[]>);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                            <Key className="w-5 h-5"/>
                            角色权限管理
                        </CardTitle>
                        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="w-4 h-4 mr-2"/>
                                    为角色分配权限
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>为角色分配权限</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="tenant">租户 *</Label>
                                        <Select
                                            value={formData.tenant}
                                            onValueChange={(value) => setFormData({
                                                ...formData,
                                                tenant: value
                                            })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="选择租户"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {tenants.map(tenant => (
                                                    <SelectItem key={tenant.id} value={tenant.id}>
                                                        {tenant.name || tenant.id}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="role">角色 *</Label>
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
                                        <Label htmlFor="object">资源对象 *</Label>
                                        <Select
                                            value={formData.object}
                                            onValueChange={(value) => setFormData({
                                                ...formData,
                                                object: value
                                            })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="选择资源对象">
                                                    {formData.object ? (
                                                        <span>{getObjectDisplayName(formData.object)} ({formData.object})</span>
                                                    ) : (
                                                        "选择资源对象"
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
                                        <Label htmlFor="action">操作权限 *</Label>
                                        <Select
                                            value={formData.action}
                                            onValueChange={(value) => setFormData({
                                                ...formData,
                                                action: value
                                            })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="选择操作权限">
                                                    {formData.action ? (
                                                        <span>{getActionDisplayName(formData.action)} ({formData.action})</span>
                                                    ) : (
                                                        "选择操作权限"
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
                                            分配权限
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
                    <div className="space-y-6">
                        {Object.keys(groupedPolicies).length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                暂无角色权限配置
                            </div>
                        ) : (
                            Object.entries(groupedPolicies).map(([tenantId, policies]) => {
                                const tenant = tenants.find(t => t.id === tenantId);
                                return (
                                    <div key={tenantId} className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-sm font-medium">
                                                租户: {tenant?.name || tenantId}
                                            </Badge>
                                            <div className="h-px bg-border flex-1"></div>
                                        </div>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>角色</TableHead>
                                                    <TableHead>资源对象</TableHead>
                                                    <TableHead>操作权限</TableHead>
                                                    <TableHead>操作</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {policies.map((policy, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            <Badge variant="secondary">
                                                                {getRoleDisplayName(policy.subject)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">
                                                                    {getObjectDisplayName(policy.object)}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    ({policy.object})
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">
                                                                {getActionDisplayName(policy.action)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemove(
                                                                    policy.subject,
                                                                    policy.domain,
                                                                    policy.object,
                                                                    policy.action
                                                                )}
                                                            >
                                                                <Trash2 className="w-4 h-4"/>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default RoleManagement;