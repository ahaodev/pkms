import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Clock, AlertCircle } from 'lucide-react';
import { formatDate, formatFileSize } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api/api';

interface ShareData {
  code: string;
  file_name: string;
  version: string;
  file_size: number;
  created_at: string;
  share_info: {
    start_at: string;
    expired_at?: string;
  };
}

export default function SharePage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!code) {
      setError('无效的分享码');
      setLoading(false);
      return;
    }

    fetchShareData();
  }, [code]);

  const fetchShareData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/share/${code}`);
      setShareData(response.data.data);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || '分享链接无效或已过期';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: '获取分享信息失败',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!code) return;

    try {
      setDownloading(true);
      const response = await apiClient.get(`/share/${code}/download`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', shareData?.file_name || 'download');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: '下载成功',
        description: '文件已开始下载',
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || '下载失败，请稍后重试';
      toast({
        variant: 'destructive',
        title: '下载失败',
        description: errorMessage,
      });
    } finally {
      setDownloading(false);
    }
  };

  const isExpired = () => {
    if (!shareData?.share_info?.expired_at) return false;
    return new Date() > new Date(shareData.share_info.expired_at);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
          <p className="text-muted-foreground">正在加载分享信息...</p>
        </div>
      </div>
    );
  }

  if (error || !shareData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center space-y-4 pt-6">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="text-center space-y-2">
              <h2 className="text-lg font-semibold">分享链接无效</h2>
              <p className="text-muted-foreground text-sm">
                {error || '该分享链接可能已过期或不存在'}
              </p>
            </div>
            <Button onClick={() => navigate('/')} variant="outline">
              返回首页
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const expired = isExpired();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6" />
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>{shareData.file_name}</span>
                    {expired && <Badge variant="destructive">已过期</Badge>}
                  </CardTitle>
                  <CardDescription>
                    版本 {shareData.version} • 分享码: {shareData.code}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 文件信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">文件大小</span>
                  <div className="font-medium">{formatFileSize(shareData.file_size)}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">创建时间</span>
                  <div className="font-medium">{formatDate(shareData.created_at)}</div>
                </div>
              </div>

              {/* 分享信息 */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">分享信息</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">分享时间:</span>
                    <div>{formatDate(shareData.share_info.start_at)}</div>
                  </div>
                  {shareData.share_info.expired_at && (
                    <div>
                      <span className="text-muted-foreground">过期时间:</span>
                      <div className={expired ? 'text-destructive' : ''}>
                        {formatDate(shareData.share_info.expired_at)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 下载按钮 */}
              <div className="flex justify-center">
                <Button
                  onClick={handleDownload}
                  disabled={expired || downloading}
                  size="lg"
                  className="min-w-[150px]"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {downloading ? '下载中...' : expired ? '分享已过期' : '下载文件'}
                </Button>
              </div>

              {expired && (
                <div className="text-center text-sm text-muted-foreground">
                  此分享链接已过期，无法下载文件。请联系分享者重新生成链接。
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}