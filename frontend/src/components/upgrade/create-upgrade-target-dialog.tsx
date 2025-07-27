import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FolderOpen, Package as PackageIcon, Activity } from 'lucide-react';
import { getReleases } from '@/lib/api/releases';
import { CreateUpgradeTargetRequest } from '@/lib/api/upgrade';
import { ExtendedPackage } from '@/types/package';
import { Project } from '@/types/project';

interface CreateUpgradeTargetDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    formData: CreateUpgradeTargetRequest;
    setFormData: React.Dispatch<React.SetStateAction<CreateUpgradeTargetRequest>>;
    projects: Project[];
    packages: ExtendedPackage[];
    isLoading: boolean;
}

export function CreateUpgradeTargetDialog({
    isOpen,
    onClose,
    onSubmit,
    formData,
    setFormData,
    projects,
    packages,
    isLoading
}: CreateUpgradeTargetDialogProps) {
    const [releases, setReleases] = useState<any[]>([]);
    const [loadingReleases, setLoadingReleases] = useState(false);

    // Filter packages by selected project
    const filteredPackages = formData.project_id
        ? packages.filter(pkg => {
            console.log('Package:', pkg, 'project_id:', formData.project_id, 'pkg.projectId:', pkg.projectId);
            return pkg.projectId === formData.project_id;
        })
        : [];

    console.log('Filtered packages count:', filteredPackages.length, 'for project:', formData.project_id);

    // Load releases when package is selected
    useEffect(() => {
        if (formData.package_id) {
            setLoadingReleases(true);
            getReleases({ packageId: formData.package_id })
                .then((response: { data: any[] }) => {
                    setReleases(response.data || []);
                })
                .catch((error: any) => {
                    console.error('Failed to load releases:', error);
                    setReleases([]);
                })
                .finally(() => {
                    setLoadingReleases(false);
                });
        } else {
            setReleases([]);
        }
    }, [formData.package_id]);

    const handleProjectChange = (projectId: string) => {
        setFormData(prev => ({
            ...prev,
            project_id: projectId,
            package_id: '',
            release_id: ''
        }));
    };

    const handlePackageChange = (packageId: string) => {
        setFormData(prev => ({
            ...prev,
            package_id: packageId,
            release_id: ''
        }));
    };

    const isFormValid = formData.project_id && formData.package_id && formData.release_id && formData.name.trim();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>创建升级目标</DialogTitle>
                    <DialogDescription>
                        选择项目、软件包和版本，创建升级目标供客户端检查更新
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Project Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="project">选择项目</Label>
                        <Select value={formData.project_id} onValueChange={handleProjectChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="请选择项目" />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map(project => (
                                    <SelectItem key={project.id} value={project.id}>
                                        <div className="flex items-center space-x-2">
                                            <FolderOpen className="h-4 w-4" />
                                            <span>{project.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Package Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="package">选择软件包</Label>
                        <Select
                            value={formData.package_id}
                            onValueChange={handlePackageChange}
                            disabled={!formData.project_id}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={formData.project_id ? "请选择软件包" : "请先选择项目"} />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredPackages.map(pkg => (
                                    <SelectItem key={pkg.id} value={pkg.id}>
                                        <div className="flex items-center space-x-2">
                                            <PackageIcon className="h-4 w-4" />
                                            <span>{pkg.name}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {pkg.type}
                                            </Badge>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Release Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="release">选择版本</Label>
                        <Select
                            value={formData.release_id}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, release_id: value }))}
                            disabled={!formData.package_id || loadingReleases}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={
                                    loadingReleases ? "加载版本中..." :
                                        formData.package_id ? "请选择版本" : "请先选择软件包"
                                } />
                            </SelectTrigger>
                            <SelectContent>
                                {releases.map(release => (
                                    <SelectItem key={release.id} value={release.id}>
                                        <div className="flex items-center space-x-2">
                                            <Activity className="h-4 w-4" />
                                            <span>{release.version_code}</span>
                                            {release.version_name && (
                                                <span className="text-sm text-muted-foreground">
                                                    - {release.version_name}
                                                </span>
                                            )}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">升级目标名称</Label>
                        <Input
                            id="name"
                            placeholder="输入升级目标名称"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">描述（可选）</Label>
                        <Textarea
                            id="description"
                            placeholder="描述此升级目标的用途..."
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        取消
                    </Button>
                    <Button onClick={onSubmit} disabled={isLoading || !isFormValid}>
                        {isLoading ? '创建中...' : '创建'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}