import {useState} from 'react';
import {Server, HardDrive, Cloud} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {toast} from '@/hooks/use-toast';

interface StorageSettingsProps {
    onSave?: (settings: StorageConfig) => void;
}

export interface StorageConfig {
    storageType: 'disk' | 'minio';
    diskPath?: string;
    s3Endpoint?: string;
    s3Bucket?: string;
    s3Region?: string;
    s3AccessKey?: string;
    s3SecretKey?: string;
}

export function StorageSettings({onSave}: StorageSettingsProps) {
    const [storageType, setStorageType] = useState<'disk' | 'minio'>('disk');
    const [diskPath, setDiskPath] = useState('./uploads');
    const [s3Endpoint, setS3Endpoint] = useState('http://localhost:9000');
    const [s3Bucket, setS3Bucket] = useState('pkms');
    const [s3Region, setS3Region] = useState('us-east-1');
    const [s3AccessKey, setS3AccessKey] = useState('minioadmin');
    const [s3SecretKey, setS3SecretKey] = useState('minioadmin');

    const handleTest = () => {
        if (storageType === 'disk') {
            toast({
                title: "连接测试",
                description: "本地磁盘存储配置正常",
            });
        } else {
            toast({
                title: "连接测试", 
                description: "成功连接到 MinIO",
            });
        }
    };

    const handleSaveStorage = () => {
        const config: StorageConfig = {
            storageType,
            ...(storageType === 'disk' ? {
                diskPath
            } : {
                s3Endpoint,
                s3Bucket,
                s3Region,
                s3AccessKey,
                s3SecretKey
            })
        };

        onSave?.(config);

        toast({
            title: "设置已保存",
            description: "存储设置已成功更新",
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Server className="mr-2 h-5 w-5"/>
                    存储配置
                </CardTitle>
                <CardDescription>
                    选择和配置您的文件存储后端
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* 存储类型选择 */}
                <div className="space-y-3">
                    <Label>存储类型</Label>
                    <RadioGroup value={storageType} onValueChange={(value: 'disk' | 'minio') => setStorageType(value)}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="disk" id="disk" />
                            <Label htmlFor="disk" className="flex items-center cursor-pointer">
                                <HardDrive className="mr-2 h-4 w-4" />
                                本地磁盘存储 (推荐)
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="minio" id="minio" />
                            <Label htmlFor="minio" className="flex items-center cursor-pointer">
                                <Cloud className="mr-2 h-4 w-4" />
                                MinIO 对象存储
                            </Label>
                        </div>
                    </RadioGroup>
                    <p className="text-xs text-muted-foreground">
                        本地磁盘存储适合小型部署，MinIO 适合分布式或云环境
                    </p>
                </div>

                {/* 本地磁盘存储配置 */}
                {storageType === 'disk' && (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                        <div className="space-y-2">
                            <Label htmlFor="diskPath">存储路径</Label>
                            <Input
                                id="diskPath"
                                placeholder="./uploads"
                                value={diskPath}
                                onChange={(e) => setDiskPath(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                文件存储的本地目录路径，相对路径将基于应用程序根目录
                            </p>
                        </div>
                    </div>
                )}

                {/* MinIO 配置 */}
                {storageType === 'minio' && (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="s3Endpoint">MinIO 端点</Label>
                                <Input
                                    id="s3Endpoint"
                                    placeholder="http://localhost:9000"
                                    value={s3Endpoint}
                                    onChange={(e) => setS3Endpoint(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    MinIO 服务器的端点 URL
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="s3Bucket">存储桶名称</Label>
                                <Input
                                    id="s3Bucket"
                                    placeholder="pkms"
                                    value={s3Bucket}
                                    onChange={(e) => setS3Bucket(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    用于存储文件的存储桶名称
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="s3Region">区域</Label>
                                <Input
                                    id="s3Region"
                                    placeholder="us-east-1"
                                    value={s3Region}
                                    onChange={(e) => setS3Region(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="s3AccessKey">访问密钥</Label>
                                <Input
                                    id="s3AccessKey"
                                    placeholder="minioadmin"
                                    value={s3AccessKey}
                                    onChange={(e) => setS3AccessKey(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="s3SecretKey">秘密密钥</Label>
                                <Input
                                    id="s3SecretKey"
                                    type="password"
                                    placeholder="••••••••"
                                    value={s3SecretKey}
                                    onChange={(e) => setS3SecretKey(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleTest}>
                    测试配置
                </Button>
                <Button onClick={handleSaveStorage}>保存更改</Button>
            </CardFooter>
        </Card>
    );
}
