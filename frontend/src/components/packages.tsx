import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {EmptyList} from '@/components/ui/empty-list';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {ChevronRight, Globe, Monitor, Package as PackageIcon, Package2, Plus, Server, Smartphone, Trash} from 'lucide-react';
import {useState} from 'react';
import {useDeletePackage} from '@/hooks/use-packages';
import {toast} from 'sonner';

interface PackagesViewProps {
    selectedProject: any;
    packages: any[];
    searchTerm: string;
    handlePackageSelect: (packageId: string) => void;
    onCreatePackage: () => void;
}

export function Packages({
                             selectedProject,
                             packages,
                             searchTerm,
                             handlePackageSelect,
                             onCreatePackage
                         }: PackagesViewProps) {
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
            toast.success('包删除成功');
            setDeletePackageId(null);
        } catch (error: any) {
            toast.error('删除失败', {
                description: error.message || '请确保包内没有发布版本'
            });
        }
    };

    const canDeletePackage = (pkg: any) => {
        // 检查包是否有releases（通过ReleaseCount或者latestRelease来判断）
        return !pkg.latestRelease && (!pkg.releaseCount || pkg.releaseCount === 0);
    };
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                    {selectedProject?.name} - 包列表
                </h2>
                <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{filteredPackages.length} 个包</Badge>
                    <Button onClick={onCreatePackage}>
                        <Plus className="mr-2 h-4 w-4"/>
                        新建包
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
                                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto"/>
                                </CardTitle>
                                <CardDescription>{pkg.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">类型</span>
                                        <Badge variant="outline" className="capitalize">{pkg.type}</Badge>
                                    </div>
                                    {pkg.version && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">最新版本</span>
                                            <Badge variant="default">v{pkg.version}</Badge>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </div>
                        {canDeletePackage(pkg) && (
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                    title={searchTerm ? '未找到匹配的包' : '该项目暂无包'}
                    actionText={
                        <div className="flex items-center">
                            <Plus className="mr-2 h-4 w-4"/>
                            创建首个包
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
                        <AlertDialogTitle>确认删除包</AlertDialogTitle>
                        <AlertDialogDescription>
                            此操作无法撤销。确定要删除此包吗？只有没有发布版本的包才能被删除。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDeletePackage}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            删除
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

