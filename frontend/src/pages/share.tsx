import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {AlertCircle, Download, FileText} from 'lucide-react';
import {useToast} from '@/hooks/use-toast';
import {apiClient} from '@/lib/api/api';

export default function SharePage() {
    const {code} = useParams<{ code: string }>();
    const {toast} = useToast();
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!code) {
            setError('无效的分享码');
            return;
        }
    }, [code]);

    const handleDownload = async () => {
        if (!code) return;

        try {
            setDownloading(true);
            const response = await apiClient.get(`/share/${code}`, {
                responseType: 'blob',
            });

            // 从响应头获取文件名
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'download.txt';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename=(.+)/);
                if (filenameMatch) {
                    filename = filenameMatch[1].replace(/"/g, '');
                }
            }
            
            // Check if response is actually HTML (indicates error)
            if (response.data.type === 'text/html') {
                throw new Error('服务器返回了错误的内容类型，请检查分享链接是否有效');
            }

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast({
                title: '下载成功',
                description: '文件已开始下载',
            });
            setError(null);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || '下载失败，请稍后重试';
            setError(errorMessage);
            toast({
                variant: 'destructive',
                title: '下载失败',
                description: errorMessage,
            });
        } finally {
            setDownloading(false);
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center space-y-4 pt-6">
                        <AlertCircle className="h-12 w-12 text-destructive"/>
                        <div className="text-center space-y-2">
                            <h2 className="text-lg font-semibold">分享链接无效</h2>
                            <p className="text-muted-foreground text-sm">
                                {error}
                            </p>
                        </div>
                        <div className="flex space-x-2">
                            <Button onClick={handleDownload} variant="outline">
                                重试下载
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex items-center justify-center space-x-3">
                        <FileText className="h-8 w-8"/>
                        <CardTitle className="text-center">文件分享</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-6">
                    <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">
                            分享码: <span className="font-mono font-medium">{code}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                            点击下方按钮开始下载文件
                        </p>
                    </div>

                    <Button
                        onClick={handleDownload}
                        disabled={downloading}
                        size="lg"
                        className="min-w-[150px]"
                    >
                        <Download className="mr-2 h-4 w-4"/>
                        {downloading ? '下载中...' : '立即下载'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}