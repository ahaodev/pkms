import {Plus} from 'lucide-react';
import {Button} from '@/components/ui/button';

interface TenantHeaderProps {
    onCreateTenant: () => void;
}

export function TenantHeader({onCreateTenant}: TenantHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">租户管理</h1>
                <p className="text-muted-foreground">
                    管理系统租户，分配用户和权限
                </p>
            </div>
            <Button onClick={onCreateTenant} className="flex items-center gap-2">
                <Plus className="h-4 w-4"/>
                创建租户
            </Button>
        </div>
    );
}