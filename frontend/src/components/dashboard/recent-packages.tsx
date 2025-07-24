import {Package as PackageIcon} from 'lucide-react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Package} from '@/types/package';
import {getTypeIcon} from '@/lib/utils';

interface RecentPackagesProps {
    packages: Package[];
    onViewAllPackages: () => void;
}

export function RecentPackages({packages, onViewAllPackages}: RecentPackagesProps) {
    const recentPackages = packages.slice(0, 5);

    return (
        <Card>
            <CardHeader>
                <CardTitle>最近发布</CardTitle>
                <CardDescription>最新上传的软件包</CardDescription>
            </CardHeader>
            <CardContent>
                {recentPackages.length > 0 ? (
                    <div className="space-y-3">
                        {recentPackages.map((pkg: Package) => (
                            <div
                                key={pkg.id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <span className="text-lg">{getTypeIcon(pkg.type)}</span>

                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {pkg.createdAt.toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={onViewAllPackages}
                        >
                            查看所有包
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 h-40">
                        <PackageIcon className="h-8 w-8 text-muted-foreground mb-2"/>
                        <p className="text-sm text-muted-foreground">暂无包</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
