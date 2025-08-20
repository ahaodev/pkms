import {Badge} from '@/components/ui/badge.tsx';
import {Button} from '@/components/ui/button.tsx';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card.tsx';
import {EmptyList} from '@/components/empty-list.tsx';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog.tsx';
import {
    ChevronRight,
    Globe,
    Monitor,
    Package as PackageIcon,
    Package2,
    Plus,
    Server,
    Smartphone,
    Trash
} from 'lucide-react';
import {useEffect, useState} from 'react';
import {useDeletePackage} from '@/hooks/use-packages.ts';
import {toast} from 'sonner';
import {useI18n} from '@/contexts/i18n-context.tsx';

interface PackagesViewProps {
    selectedProject: any;
    packages: any[];
    searchTerm: string;
    handlePackageSelect: (packageId: string) => void;
    onCreatePackage: () => void;
    onBackToProjects?: () => void; // 新增：鼠标后退回调
}

export function Packages({
                             selectedProject,
                             packages,
                             searchTerm,
                             handlePackageSelect,
                             onCreatePackage,
                             onBackToProjects
                         }: PackagesViewProps) {
    const {t} = useI18n();
    const [deletePackageId, setDeletePackageId] = useState<string | null>(null);
    const deletePackageMutation = useDeletePackage();

    // Filter packages based on search term
    const filteredPackages = packages.filter(pkg =>
        pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDeletePackage = async () => {
        if (!deletePackageId) return;

        try {
            await deletePackageMutation.mutateAsync(deletePackageId);
            toast.success(t('package.deleteSuccess'));
            setDeletePackageId(null);
        } catch (error: any) {
            toast.error(t('package.deleteError'), {
                description: error.message || t('package.deleteErrorDescription')
            });
        }
    };

    const canDeletePackage = (pkg: any) => {
        // 检查包是否有releases（通过ReleaseCount或者latestRelease来判断）
        return !pkg.latestRelease && (!pkg.releaseCount || pkg.releaseCount === 0);
    };

    // 监听鼠标后退按钮和浏览器后退，回退到 projects 页面
    useEffect(() => {
        // 使用全局window对象存储防抖标志，避免组件切换时标志丢失
        const getGlobalFlag = () => (window as any).__hierarchyBackProcessing || false;
        const setGlobalFlag = (value: boolean) => {
            (window as any).__hierarchyBackProcessing = value;
        };

        const executeBackToProjects = () => {
            if (getGlobalFlag()) {
                return;
            }

            setGlobalFlag(true);

            if (onBackToProjects) {
                onBackToProjects();
            }

            // 300ms防抖
            setTimeout(() => {
                setGlobalFlag(false);
            }, 300);
        };

        const handleMouseBack = (event: MouseEvent) => {
            // 检查是否是鼠标后退按钮 (button 3)
            if (event.button === 3) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();

                executeBackToProjects();
                return false;
            }
        };

        const handlePopState = (event: PopStateEvent) => {
            console.log('⌨️ Packages: Browser back button pressed (popstate)');
            event.preventDefault();
            event.stopPropagation();

            executeBackToProjects();
            return false;
        };

        // 添加事件监听器
        document.addEventListener('mousedown', handleMouseBack, {capture: true});
        window.addEventListener('popstate', handlePopState);

        // 推送历史状态以便拦截浏览器后退
        window.history.pushState(null, '', window.location.href);

        // 清理事件监听器
        return () => {
            document.removeEventListener('mousedown', handleMouseBack, {capture: true});
            window.removeEventListener('popstate', handlePopState);
        };
    }, [onBackToProjects]);
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                    {selectedProject?.name} - {t('package.list')}
                </h2>
                <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{filteredPackages.length} {t('package.count')}</Badge>
                    <Button onClick={onCreatePackage}>
                        <Plus className="mr-2 h-4 w-4"/>
                        {t('package.newPackage')}
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
                {filteredPackages.map((pkg) => (
                    <Card
                        key={pkg.id}
                        className="cursor-pointer hover:shadow-md transition-shadow relative group"
                    >
                        <div onClick={() => handlePackageSelect(pkg.id)}>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-3">
                                    {
                                        (() => {
                                            switch (pkg?.type) {
                                                case 'android':
                                                    return <Smartphone className="h-5 w-5 text-green-600"/>;
                                                case 'web':
                                                    return <Globe className="h-5 w-5 text-green-600"/>;
                                                case 'desktop':
                                                    return <Monitor className="h-5 w-5 text-green-600"/>;
                                                case 'linux':
                                                    return <Server className="h-5 w-5 text-green-600"/>;
                                                case 'other':
                                                    return <Package2 className="h-5 w-5 text-green-600"/>;
                                                default:
                                                    return <PackageIcon className="h-5 w-5 text-green-600"/>;
                                            }
                                        })()
                                    }
                                    <span>{pkg.name}</span>
                                    <ChevronRight
                                        className="h-4 w-4 text-muted-foreground ml-auto group-hover:opacity-0 transition-opacity"/>
                                </CardTitle>
                                <CardDescription>{pkg.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">{t('package.type')}</span>
                                        <Badge variant="outline" className="capitalize">{pkg.type}</Badge>
                                    </div>
                                    {pkg.version && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">{t('package.latestVersion')}</span>
                                            <Badge variant="default">v{pkg.version}</Badge>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </div>
                        {canDeletePackage(pkg) && (
                            <div
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeletePackageId(pkg.id);
                                    }}
                                >
                                    <Trash className="h-4 w-4 text-red-500"/>
                                </Button>
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            {filteredPackages.length === 0 && (
                <EmptyList
                    icon={PackageIcon}
                    title={searchTerm ? t('package.noPackagesFound') : t('package.noPackagesInProject')}
                    actionText={
                        <div className="flex items-center">
                            <Plus className="mr-2 h-4 w-4"/>
                            {t('package.createFirstPackage')}
                        </div>
                    }
                    onAction={onCreatePackage}
                    showAction={true}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletePackageId} onOpenChange={() => setDeletePackageId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('package.deleteConfirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('package.deleteConfirmDescription')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeletePackage}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {t('common.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

