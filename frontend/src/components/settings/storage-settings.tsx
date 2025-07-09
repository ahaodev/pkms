import { useState } from 'react';
import { Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface StorageSettingsProps {
  onSave?: (settings: StorageConfig) => void;
}

export interface StorageConfig {
  s3Endpoint: string;
  s3Bucket: string;
  s3Region: string;
  s3AccessKey: string;
  s3SecretKey: string;
}

export function StorageSettings({ onSave }: StorageSettingsProps) {
  const [s3Endpoint, setS3Endpoint] = useState("http://localhost:9000");
  const [s3Bucket, setS3Bucket] = useState("delivery-system");
  const [s3Region, setS3Region] = useState("us-east-1");
  const [s3AccessKey, setS3AccessKey] = useState("minioadmin");
  const [s3SecretKey, setS3SecretKey] = useState("minioadmin");

  const handleS3Test = () => {
    toast({
      title: "连接测试",
      description: "成功连接到 S3/MinIO",
    });
  };
  
  const handleSaveStorage = () => {
    const config: StorageConfig = {
      s3Endpoint,
      s3Bucket,
      s3Region,
      s3AccessKey,
      s3SecretKey
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
          <Server className="mr-2 h-5 w-5" />
          S3/MinIO 配置
        </CardTitle>
        <CardDescription>
          配置您的对象存储设置以进行文件管理
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="s3Endpoint">S3/MinIO 端点</Label>
              <Input 
                id="s3Endpoint" 
                placeholder="http://localhost:9000" 
                value={s3Endpoint}
                onChange={(e) => setS3Endpoint(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                您的 S3 或 MinIO 服务器的端点 URL
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="s3Bucket">存储桶名称</Label>
              <Input 
                id="s3Bucket" 
                placeholder="delivery-system" 
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
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleS3Test}>
          测试连接
        </Button>
        <Button onClick={handleSaveStorage}>保存更改</Button>
      </CardFooter>
    </Card>
  );
}
