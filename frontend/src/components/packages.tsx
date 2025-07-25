import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {ChevronRight, Globe, Monitor, Package as PackageIcon, Package2, Plus, Server, Smartphone} from 'lucide-react';

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
    // Filter packages based on search term
    const filteredPackages = packages.filter(pkg =>
        pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
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
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handlePackageSelect(pkg.id)}
                    >
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
                    </Card>
                ))}
            </div>

            {filteredPackages.length === 0 && (
                <Card>
                    <CardContent className="flex items-center justify-center py-8">
                        <div className="text-center space-y-2">
                            <PackageIcon className="h-12 w-12 text-muted-foreground mx-auto"/>
                            <div className="text-muted-foreground">
                                {searchTerm ? '未找到匹配的包' : '该项目暂无包'}
                            </div>
                            <Button onClick={onCreatePackage}>
                                <Plus className="mr-2 h-4 w-4"/>
                                创建首个包
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

