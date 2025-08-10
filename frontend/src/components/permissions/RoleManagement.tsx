import React, {useCallback, useMemo} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import {Key, Plus, Trash2} from 'lucide-react';
import {EmptyList} from '@/components/ui/empty-list';
import {useTenants} from '@/hooks/use-tenants';
import {usePermissionOperations} from '@/hooks/use-permission-operations';
import {validateRolePermissionForm} from '@/utils/permission-validation';
import {useFormState} from '@/hooks/use-form-state';
import {getActionDisplayName, getObjectDisplayName, getRoleDisplayName} from '@/lib/utils/permission-utils';
import type {EnhancedPolicy, RolePolicyForm} from '@/types';
import {ASSIGNABLE_ROLES} from '@/types';

// PolicyRow component for better performance and reusability
const PolicyRow = React.memo(({ 
    policy, 
    isLoading, 
    onRemove 
}: { 
    policy: EnhancedPolicy; 
    isLoading: boolean;
    onRemove: (role: string, domain: string, object: string, action: string) => void;
}) => {
    const handleRemove = useCallback(() => {
        onRemove(policy.subject, policy.domain, policy.object, policy.action);
    }, [onRemove, policy.subject, policy.domain, policy.object, policy.action]);

    return (
        <TableRow key={`${policy.subject}-${policy.domain}-${policy.object}-${policy.action}`}>
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
                    onClick={handleRemove}
                    disabled={isLoading}
                >
                    <Trash2 className="w-4 h-4"/>
                </Button>
            </TableCell>
        </TableRow>
    );
});

PolicyRow.displayName = 'PolicyRow';

interface RoleManagementProps {
    enhancedPolicies: EnhancedPolicy[];
    objects: string[];
    actions: string[];
    onRefresh: () => Promise<void>;
}

const RoleManagement: React.FC<RoleManagementProps> = React.memo(({
    enhancedPolicies,
    objects,
    actions,
    onRefresh
}) => {
    const {data: tenants = []} = useTenants();
    const {rolePermissions} = usePermissionOperations();
    const [showAddDialog, setShowAddDialog] = React.useState(false);
    
    const initialFormData: RolePolicyForm = useMemo(() => ({
        role: '',
        tenant: '',
        object: '',
        action: ''
    }), []);
    
    const {
        formData,
        error,
        isLoading,
        resetForm,
        updateField,
        setFormError,
        setFormLoading
    } = useFormState(initialFormData);

    const assignableRoles = useMemo(() => [...ASSIGNABLE_ROLES], []);

    // 过滤出角色权限策略（排除admin和直接用户权限）
    const rolePolicies = useMemo(() => 
        enhancedPolicies.filter(policy =>
            (assignableRoles as readonly string[]).includes(policy.subject) && policy.subject !== 'admin'
        ),
        [enhancedPolicies, assignableRoles]
    );

    const handleAdd = useCallback(async () => {
        const validation = validateRolePermissionForm(formData);
        if (!validation.isValid) {
            setFormError('请填写所有必填字段');
            return;
        }

        setFormLoading(true);
        setFormError(null);
        try {
            const success = await rolePermissions.add(formData, onRefresh);
            if (success) {
                setShowAddDialog(false);
                resetForm();
            } else {
                setFormError('分配权限失败，请重试');
            }
        } catch (error) {
            console.error('Failed to add role permission:', error);
            setFormError('分配权限失败，请检查网络连接');
        } finally {
            setFormLoading(false);
        }
    }, [formData, rolePermissions, onRefresh, resetForm, setFormError, setFormLoading]);

    const handleRemove = useCallback(async (role: string, domain: string, object: string, action: string) => {
        setFormLoading(true);
        setFormError(null);
        try {
            await rolePermissions.remove(role, domain, object, action, onRefresh);
        } catch (error) {
            console.error('Failed to remove role permission:', error);
            setFormError('删除权限失败，请重试');
        } finally {
            setFormLoading(false);
        }
    }, [rolePermissions, onRefresh, setFormError, setFormLoading]);

    // 按租户分组显示角色权限
    const groupedPolicies = useMemo(() => 
        rolePolicies.reduce((acc, policy) => {
            const tenantKey = policy.domain;
            if (!acc[tenantKey]) {
                acc[tenantKey] = [];
            }
            acc[tenantKey].push(policy);
            return acc;
        }, {} as Record<string, EnhancedPolicy[]>),
        [rolePolicies]
    );

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
                                            onValueChange={useCallback((value: string) => {
                                                updateField('tenant', value);
                                            }, [updateField])}
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
                                            onValueChange={useCallback((value: string) => {
                                                updateField('role', value);
                                            }, [updateField])}
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
                                            onValueChange={useCallback((value: string) => {
                                                updateField('object', value);
                                            }, [updateField])}
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
                                            onValueChange={useCallback((value: string) => {
                                                updateField('action', value);
                                            }, [updateField])}
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
                                    {error && (
                                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                                            {error}
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <Button 
                                            onClick={handleAdd} 
                                            className="flex-1"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? '分配中...' : '分配权限'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={useCallback(() => {
                                                setShowAddDialog(false);
                                                resetForm();
                                            }, [resetForm])}
                                            className="flex-1"
                                            disabled={isLoading}
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
                            <EmptyList
                                icon={Key}
                                title="暂无角色权限配置"
                                description="开始为角色分配权限来管理系统访问控制"
                            />
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
                                                {policies.map((policy) => (
                                                    <PolicyRow
                                                        key={`${policy.subject}-${policy.domain}-${policy.object}-${policy.action}`}
                                                        policy={policy}
                                                        isLoading={isLoading}
                                                        onRemove={handleRemove}
                                                    />
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
});

RoleManagement.displayName = 'RoleManagement';

export default RoleManagement;