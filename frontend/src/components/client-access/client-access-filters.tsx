import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Filter} from 'lucide-react';
import {useProjects} from '@/hooks/use-projects';
import {usePackages} from '@/hooks/use-packages';
import type {ClientAccessFilters as Filters} from '@/types/client-access';

interface ClientAccessFiltersProps {
    filters: Filters;
    onFiltersChange: (filters: Filters) => void;
}

export function ClientAccessFilters({
                                        filters,
                                        onFiltersChange,
                                    }: ClientAccessFiltersProps) {
    const {data: projects = []} = useProjects();
    const packagesResult = usePackages({
        projectId: filters.project_id
    });
    const packages = packagesResult?.data?.data || [];

    const handleProjectChange = (projectId: string) => {
        onFiltersChange({
            ...filters,
            project_id: projectId === 'all' ? undefined : projectId,
            package_id: undefined, // 重置包选择
        });
    };

    const handlePackageChange = (packageId: string) => {
        onFiltersChange({
            ...filters,
            package_id: packageId === 'all' ? undefined : packageId,
        });
    };
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Filter className="h-4 w-4"/>
                    筛选条件
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 项目筛选 */}
                    <div className="space-y-2">
                        <Label>项目</Label>
                        <Select
                            value={filters.project_id || 'all'}
                            onValueChange={handleProjectChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="选择项目"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">全部项目</SelectItem>
                                {projects.map((project) => (
                                    <SelectItem key={project.id} value={project.id}>
                                        {project.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 包筛选 */}
                    <div className="space-y-2">
                        <Label>包</Label>
                        <Select
                            value={filters.package_id || 'all'}
                            onValueChange={handlePackageChange}
                            disabled={!filters.project_id}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="选择包"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">全部包</SelectItem>
                                {packages.map((pkg) => (
                                    <SelectItem key={pkg.id} value={pkg.id}>
                                        {pkg.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}