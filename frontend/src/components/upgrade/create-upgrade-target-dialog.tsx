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
import {getReleases, Release} from '@/lib/api/releases';
import { getPackages } from '@/lib/api/packages';
import { CreateUpgradeTargetRequest } from '@/lib/api/upgrade';
import { Package } from '@/types/package';
import { Project } from '@/types/project';
import { useI18n } from '@/contexts/i18n-context';

interface CreateUpgradeTargetDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    formData: CreateUpgradeTargetRequest;
    setFormData: React.Dispatch<React.SetStateAction<CreateUpgradeTargetRequest>>;
    projects: Project[];
    isLoading: boolean;
}

export function CreateUpgradeTargetDialog({
    isOpen,
    onClose,
    onSubmit,
    formData,
    setFormData,
    projects,
    isLoading
}: CreateUpgradeTargetDialogProps) {
    const { t } = useI18n();
    const [packages, setPackages] = useState<Package[]>([]);
    const [loadingPackages, setLoadingPackages] = useState(false);
    const [releases, setReleases] = useState<Release[]>([]);
    const [loadingReleases, setLoadingReleases] = useState(false);

    // Fetch packages when project is selected
    useEffect(() => {
        if (formData.project_id) {
            setLoadingPackages(true);
            getPackages({ projectId: formData.project_id })
                .then((response) => {
                    setPackages(response.list || []);
                })
                .catch((error) => {
                    console.error('Failed to load packages:', error);
                    setPackages([]);
                })
                .finally(() => {
                    setLoadingPackages(false);
                });
        } else {
            setPackages([]);
        }
    }, [formData.project_id]);

    // Load releases when package is selected
    useEffect(() => {
        if (formData.package_id) {
            setLoadingReleases(true);
            getReleases({ packageId: formData.package_id })
                .then((response) => {
                    // API 返回格式: { data: { list: Release[], total: number, ... } }
                    setReleases(response.data?.list || []);
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
                    <DialogTitle>{t('upgrade.createTarget')}</DialogTitle>
                    <DialogDescription>
                        {t('upgrade.createTargetDescription')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Project Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="project">{t('upgrade.selectProject')}</Label>
                        <Select value={formData.project_id} onValueChange={handleProjectChange}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('upgrade.selectProjectPlaceholder')} />
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
                        <Label htmlFor="package">{t('upgrade.selectPackage')}</Label>
                        <Select
                            value={formData.package_id}
                            onValueChange={handlePackageChange}
                            disabled={!formData.project_id || loadingPackages}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={
                                    loadingPackages ? t('upgrade.loadingPackages') :
                                    formData.project_id ? t('upgrade.selectPackagePlaceholder') : t('upgrade.selectProjectFirst')
                                } />
                            </SelectTrigger>
                            <SelectContent>
                                {packages
                                    .filter(pkg => pkg && pkg.id) // Additional safety check
                                    .map(pkg => (
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
                                {packages.length === 0 && formData.project_id && !loadingPackages && (
                                    <div className="p-2 text-center text-sm text-muted-foreground">
                                        {t('upgrade.noPackagesFound')}
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Release Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="release">{t('upgrade.selectVersion')}</Label>
                        <Select
                            value={formData.release_id}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, release_id: value }))}
                            disabled={!formData.package_id || loadingReleases}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={
                                    loadingReleases ? t('upgrade.loadingVersions') :
                                        formData.package_id ? t('upgrade.selectVersionPlaceholder') : t('upgrade.selectPackageFirst')
                                } />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.isArray(releases) && releases.map(item => (
                                    <SelectItem key={item.id} value={item.id}>
                                        <div className="flex items-center space-x-2">
                                            <Activity className="h-4 w-4" />
                                            <span>{item.version_code}</span>
                                            {item.version_name && (
                                                <span className="text-sm text-muted-foreground">
                                                    - {item.version_name}
                                                </span>
                                            )}
                                        </div>
                                    </SelectItem>
                                ))}
                                {(!Array.isArray(releases) || releases.length === 0) && formData.package_id && !loadingReleases && (
                                    <div className="p-2 text-center text-sm text-muted-foreground">
                                        {t('upgrade.noVersionsFound')}
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">{t('upgrade.targetName')}</Label>
                        <Input
                            id="name"
                            placeholder={t('upgrade.targetNamePlaceholder')}
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">{t('upgrade.descriptionOptional')}</Label>
                        <Textarea
                            id="description"
                            placeholder={t('upgrade.descriptionPlaceholder')}
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        {t('common.cancel')}
                    </Button>
                    <Button onClick={onSubmit} disabled={isLoading || !isFormValid}>
                        {isLoading ? t('upgrade.creating') : t('common.create')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}