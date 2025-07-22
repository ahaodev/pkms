import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { UserPermission } from '@/types';

interface UserPermissionsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    userPermissions: UserPermission[];
    selectedUserId: string;
}

const UserPermissionsDialog: React.FC<UserPermissionsDialogProps> = ({
    isOpen,
    onClose,
    userPermissions,
    selectedUserId
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>用户权限详情 - {selectedUserId}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {userPermissions.map((permission, index) => (
                        <div key={index} className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">用户角色</h4>
                                <div className="flex flex-wrap gap-2">
                                    {permission.roles.map((role, roleIndex) => (
                                        <Badge key={roleIndex} variant="secondary">
                                            {role}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="font-semibold mb-2">权限列表</h4>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>主体</TableHead>
                                            <TableHead>对象</TableHead>
                                            <TableHead>操作</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {permission.permissions.map((perm, permIndex) => (
                                            <TableRow key={permIndex}>
                                                <TableCell>
                                                    <Badge
                                                        variant={perm[0] === permission.user_id ? "default" : "secondary"}
                                                    >
                                                        {perm[0]}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{perm[1]}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{perm[2]}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default UserPermissionsDialog;