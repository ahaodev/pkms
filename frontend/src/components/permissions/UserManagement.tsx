import React, {useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import {Eye, Trash2, UserPlus, Users} from 'lucide-react';
import {useTenants} from '@/hooks/use-tenants';
import {usePermissionOperations} from '@/hooks/use-permission-operations';
import {validateUserRoleForm} from '@/utils/permission-validation';
import {getRoleDisplayName} from '@/lib/utils/permission-utils';
import type {EnhancedRole, User, UserRoleForm} from '@/types';
import {ASSIGNABLE_ROLES} from '@/types';

interface UserManagementProps {
    enhancedRoles: EnhancedRole[];
    users: User[];
    onRefresh: () => Promise<void>;
    onShowUserPermissions: (userId: string) => Promise<void>;
}

const UserManagement: React.FC<UserManagementProps> = ({
    enhancedRoles,
    users,
    onRefresh,
    onShowUserPermissions
}) => {
    const {data: tenants = []} = useTenants();
    const {userRoles} = usePermissionOperations();
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [formData, setFormData] = useState<UserRoleForm>({
        user_id: '',
        role: '',
        tenant: ''
    });

    const assignableRoles = [...ASSIGNABLE_ROLES];

    const handleAdd = async () => {
        const validation = validateUserRoleForm(formData);
        if (!validation.isValid) {
            return;
        }

        const success = await userRoles.add(formData, onRefresh);
        if (success) {
            setShowAddDialog(false);
            setFormData({
                user_id: '',
                role: '',
                tenant: ''
            });
        }
    };

    const handleRemove = async (userId: string, role: string, domain: string) => {
        await userRoles.remove(userId, role, domain, onRefresh);
    };

    // 按租户分组显示用户角色分配
    const groupedRoles = enhancedRoles.reduce((acc, role) => {
        const tenantKey = role.domain;
        if (!acc[tenantKey]) {
            acc[tenantKey] = [];
        }
        acc[tenantKey].push(role);
        return acc;
    }, {} as Record<string, EnhancedRole[]>);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5"/>
                            用户角色管理
                        </CardTitle>
                        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                            <DialogTrigger asChild>
                                <Button>
                                    <UserPlus className="w-4 h-4 mr-2"/>
                                    为用户分配角色
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>为用户分配角色</DialogTitle>
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
                                        <Label htmlFor="user_id">用户 *</Label>
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
                                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                                        <strong>说明：</strong>用户在指定租户下将获得所选角色的所有权限。
                                    </div>
                                    <div className="flex gap-2">
                                        <Button onClick={handleAdd} className="flex-1">
                                            分配角色
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
                        {Object.keys(groupedRoles).length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                暂无用户角色分配
                            </div>
                        ) : (
                            Object.entries(groupedRoles).map(([tenantId, roles]) => {
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
                                                    <TableHead>用户</TableHead>
                                                    <TableHead>角色</TableHead>
                                                    <TableHead>操作</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {roles.map((role, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{role.user_name}</span>
                                                                {role.user && (
                                                                    <span className="text-sm text-muted-foreground">
                                                                        ({role.user})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary">
                                                                {getRoleDisplayName(role.role)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => onShowUserPermissions(role.user)}
                                                                    title="查看用户权限"
                                                                >
                                                                    <Eye className="w-4 h-4"/>
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleRemove(
                                                                        role.user,
                                                                        role.role,
                                                                        role.domain
                                                                    )}
                                                                    title="移除角色"
                                                                >
                                                                    <Trash2 className="w-4 h-4"/>
                                                                </Button>
                                                            </div>
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

export default UserManagement;