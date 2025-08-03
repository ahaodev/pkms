import {useQueryClient} from '@tanstack/react-query';
import {Card, CardContent} from '@/components/ui/card';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {Skeleton} from '@/components/ui/skeleton';
import {AlertCircle, Eye, Trash2} from 'lucide-react';
import {format} from 'date-fns';
import {ShareListItem} from '@/lib/api/shares';

interface SharesTableProps {
  shares: ShareListItem[] | undefined;
  isLoading: boolean;
  error: any;
  onDeleteClick: (share: ShareListItem) => void;
  onViewClick: (share: ShareListItem) => void;
}

export function SharesTable({ shares, isLoading, error, onDeleteClick, onViewClick }: SharesTableProps) {
  const queryClient = useQueryClient();

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
  };


  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">加载失败</h3>
            <p className="text-muted-foreground mb-4">无法加载分享列表</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['shares'] })}>
              重试
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="space-y-4 p-6">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex space-x-4">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-4 w-[80px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!shares || shares.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <div className="text-muted-foreground">暂无分享链接</div>
              <div className="text-sm text-muted-foreground">
                在发布版本页面创建分享链接后，会显示在这里
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>项目</TableHead>
              <TableHead>包</TableHead>
              <TableHead>版本</TableHead>
              <TableHead>分享码</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shares.map((share) => (
              <TableRow key={share.id}>
                <TableCell className="font-medium">
                  {share.project_name}
                </TableCell>
                <TableCell>{share.package_name}</TableCell>
                <TableCell>
                  <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                    {share.version}
                  </code>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                      {share.code}
                    </code>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(share.start_at)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewClick(share)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteClick(share)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}