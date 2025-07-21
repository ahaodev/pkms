import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Download, Package as PackageIcon, Plus} from 'lucide-react';
import {formatDate, formatFileSize} from '@/lib/utils';
import {Release} from '@/types/release.ts';

interface ReleasesViewProps {
    selectedPackage: any;
    releases: Release[];
    searchTerm: string;
    handleCreateRelease: () => void;
    handleDownload: (release: Release) => void;
}

export function Releases({
                             selectedPackage,
                             releases,
                             searchTerm,
                             handleCreateRelease,
                             handleDownload
                         }: ReleasesViewProps) {
    // Filter releases based on search term
    const filteredReleases = releases.filter(release =>
        release.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (release.title?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (release.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        release.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                    {selectedPackage?.name}
                </h2>
                <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{releases.length} 个发布</Badge>
                    <Button onClick={handleCreateRelease}>
                        <Plus className="mr-2 h-4 w-4"/>
                        新建发布
                    </Button>
                </div>

            </div>
            <div className="space-y-4">
                {filteredReleases.map((release) => (
                    <Card key={release.id}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div>
                                        <CardTitle className="flex items-center space-x-2">
                                            <span>v{release.version}</span>
                                            {release.isLatest && (
                                                <Badge variant="default">最新</Badge>
                                            )}
                                            {release.isPrerelease && (
                                                <Badge variant="secondary">预发布</Badge>
                                            )}
                                            {release.isDraft && (
                                                <Badge variant="outline">草稿</Badge>
                                            )}
                                        </CardTitle>
                                        <CardDescription>{release.title}</CardDescription>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button variant="outline" size="sm"
                                            onClick={() => handleDownload(release)}>
                                        <Download className="h-4 w-4 mr-2"/>
                                        下载
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">{release.description}</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">文件名:</span>
                                        <div className="font-medium">{release.fileName}</div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">文件大小:</span>
                                        <div className="font-medium">{formatFileSize(release.fileSize)}</div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">下载次数:</span>
                                        <div className="font-medium">{release.downloadCount.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">发布时间:</span>
                                        <div className="font-medium">{formatDate(release.createdAt.toISOString())}</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {filteredReleases.length === 0 && (
                <Card>
                    <CardContent className="flex items-center justify-center py-8">
                        <div className="text-center space-y-2">
                            <PackageIcon className="h-12 w-12 text-muted-foreground mx-auto"/>
                            <div className="text-muted-foreground">
                                {searchTerm ? '未找到匹配的发布版本' : '该包暂无版本发布'}
                            </div>
                            {!searchTerm && (
                                <Button onClick={handleCreateRelease}>
                                    <Plus className="mr-2 h-4 w-4"/>
                                    创建首个发布
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

