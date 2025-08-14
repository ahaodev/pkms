import React, {useState, useCallback, useMemo} from 'react';
import { useI18n } from '@/contexts/i18n-context';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {Input} from '@/components/ui/input';
import {Eye, Trash2, UserPlus, Users, Loader2, Search} from 'lucide-react';
import {EmptyList} from '@/components/ui/empty-list';
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

interface TenantInfo {
    id: string;
    name: string;
}
const UserManagement: React.FC<UserManagementProps> = React.memo(({
    enhancedRoles,
    users,
    onRefresh,
    onShowUserPermissions
}) => {
    const { t } = useI18n();
    const {data: tenants = []} = useTenants();
    const {userRoles} = usePermissionOperations();
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [formData, setFormData] = useState<UserRoleForm>({
        user_id: '',
        role: '',
        tenant: ''
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedTenant, setSelectedTenant] = useState<string>('all');

    const assignableRoles = useMemo(() => [...ASSIGNABLE_ROLES], []);

    const handleAdd = useCallback(async () => {
        const validation = validateUserRoleForm(formData);
        if (!validation.isValid) {
            setError(t('validation.required'));
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            const success = await userRoles.add(formData, onRefresh);
            if (success) {
                setShowAddDialog(false);
                setFormData({
                    user_id: '',
                    role: '',
                    tenant: ''
                });
            }
        } catch {
            setError(t('user.assignRoleFailed'));
        } finally {
            setIsLoading(false);
        }
    }, [formData, userRoles, onRefresh]);

    const handleRemove = useCallback(async (userId: string, role: string, domain: string) => {
        if (!confirm(t('user.removeRoleConfirm'))) {
            return;
        }
        
        setIsLoading(true);
        try {
            await userRoles.remove(userId, role, domain, onRefresh);
        } catch {
            setError(t('user.removeRoleFailed'));
        } finally {
            setIsLoading(false);
        }
    }, [userRoles, onRefresh]);

    const handleFormChange = useCallback((field: keyof UserRoleForm, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError(null);
    }, []);

    const resetForm = useCallback(() => {
        setFormData({ user_id: '', role: '', tenant: '' });
        setError(null);
        setShowAddDialog(false);
    }, []);

    // 筛选和搜索逻辑
    const filteredRoles = useMemo(() => {
        let filtered = enhancedRoles;
        
        // 按租户筛选
        if (selectedTenant !== 'all') {
            filtered = filtered.filter(role => role.domain === selectedTenant);
        }
        
        // 按搜索词筛选（用户名或角色）
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(role => 
                role.user_name?.toLowerCase().includes(term) ||
                role.user?.toLowerCase().includes(term) ||
                getRoleDisplayName(role.role).toLowerCase().includes(term) ||
                role.role.toLowerCase().includes(term)
            );
        }
        
        return filtered;
    }, [enhancedRoles, selectedTenant, searchTerm]);
    
    // 按租户分组显示用户角色分配
    const groupedRoles = useMemo(() => {
        return filteredRoles.reduce((acc, role) => {
            const tenantKey = role.domain;
            if (!acc[tenantKey]) {
                acc[tenantKey] = [];
            }
            acc[tenantKey].push(role);
            return acc;
        }, {} as Record<string, EnhancedRole[]>);
    }, [filteredRoles]);
    
    // 获取唯一租户列表
    const uniqueTenants = useMemo<TenantInfo[]>(() => {
        const tenantSet = new Set(enhancedRoles.map(role => role.domain));
        return Array.from(tenantSet).map(tenantId => {
            const tenant = tenants.find(t => t.id === tenantId);
            return {
                id: tenantId,
                name: tenant?.name || tenantId
            };
        });
    }, [enhancedRoles, tenants]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5"/>
                            {t('user.roleManagement')}
                        </CardTitle>
                        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                            <DialogTrigger asChild>
                                <Button>
                                    <UserPlus className="w-4 h-4 mr-2"/>
                                    {t('user.assignRole')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{t('user.assignRole')}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    {error && (
                                        <Alert variant="destructive">
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}
                                    <div>
                                        <Label htmlFor="tenant">{t('tenant.name')} *</Label>
                                        <Select
                                            value={formData.tenant}
                                            onValueChange={(value) => handleFormChange('tenant', value)}
                                            disabled={isLoading}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('permission.selectTenant')}/>
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
                                        <Label htmlFor="user_id">{t('user.name')} *</Label>
                                        <Select
                                            value={formData.user_id}
                                            onValueChange={(value) => handleFormChange('user_id', value)}
                                            disabled={isLoading}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('user.selectUser')}/>
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
                                        <Label htmlFor="role">{t('user.role')} *</Label>
                                        <Select
                                            value={formData.role}
                                            onValueChange={(value) => handleFormChange('role', value)}
                                            disabled={isLoading}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="选择角色">
                                                    {formData.role ? (
                                                        <span>{getRoleDisplayName(formData.role)} ({formData.role})</span>
                                                    ) : (
                                                        t('permission.selectRole')
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
                                        <strong>{t('user.assignRoleDescription')}:</strong> {t('user.assignRoleNote')}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button 
                                            onClick={handleAdd} 
                                            className="flex-1" 
                                            disabled={isLoading}
                                        >
                                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                            {t('user.assignRole')}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={resetForm}
                                            className="flex-1"
                                            disabled={isLoading}
                                        >
                                            {t('common.cancel')}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* 搜索和筛选区域 */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    placeholder={t('user.searchPlaceholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select
                                value={selectedTenant}
                                onValueChange={setSelectedTenant}
                            >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder={t('user.filterTenant')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('user.allTenants')}</SelectItem>
                                    {uniqueTenants.map(tenant => (
                                        <SelectItem key={tenant.id} value={tenant.id}>
                                            {tenant.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {/* 结果统计 */}
                        {(searchTerm || selectedTenant !== 'all') && (
                            <div className="text-sm text-muted-foreground">
                                {t('user.foundRecords', { count: filteredRoles.length })}
                                {searchTerm && <span> {t('user.containing', { term: searchTerm })}</span>}
                                {selectedTenant !== 'all' && <span> {t('user.inTenant', { tenant: uniqueTenants.find(t => t.id === selectedTenant)?.name })}</span>}
                            </div>
                        )}
                        
                        {Object.keys(groupedRoles).length === 0 ? (
                            <EmptyList
                                icon={Users}
                                title={
                                    searchTerm || selectedTenant !== 'all'
                                        ? t('user.noMatchingRoles')
                                        : t('user.noUserRoles')
                                }
                                description={
                                    searchTerm || selectedTenant !== 'all'
                                        ? t('user.adjustSearchFilters')
                                        : t('user.noUserRolesDescription')
                                }
                            />
                        ) : (
                            Object.entries(groupedRoles).map(([tenantId, roles]) => {
                                const tenant = tenants.find(t => t.id === tenantId);
                                return (
                                    <div key={tenantId} className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-sm font-medium">
                                                {t('tenant.name')}: {tenant?.name || tenantId}
                                            </Badge>
                                            <div className="h-px bg-border flex-1"></div>
                                        </div>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>{t('user.name')}</TableHead>
                                                    <TableHead>{t('user.role')}</TableHead>
                                                    <TableHead>{t('common.actions')}</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {roles.map((role, index) => (
                                                    <TableRow key={`${role.user}-${role.role}-${role.domain}-${index}`}>
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
                                                                    title={t('user.viewPermissions')}
                                                                    disabled={isLoading}
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
                                                                    title={t('user.removeRole')}
                                                                    disabled={isLoading}
                                                                    className="text-destructive hover:text-destructive"
                                                                >
                                                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4"/>}
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
});

UserManagement.displayName = 'UserManagement';

export default UserManagement;