import {useQueryClient} from '@tanstack/react-query';
import { useI18n } from '@/contexts/i18n-context';
import {Card, CardContent} from '@/components/ui/card';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {EmptyList} from '@/components/empty-list.tsx';
import {AlertCircle, Eye, Share2, Trash2} from 'lucide-react';
import {format} from 'date-fns';
import {ShareListItem} from '@/lib/api/shares';
import {CustomSkeleton} from "@/components/custom-skeleton.tsx";

interface SharesTableProps {
  shares: ShareListItem[] | undefined;
  isLoading: boolean;
  error: any;
  onDeleteClick: (share: ShareListItem) => void;
  onViewClick: (share: ShareListItem) => void;
}

export function SharesTable({ shares, isLoading, error, onDeleteClick, onViewClick }: SharesTableProps) {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
  };

  const getExpiryDisplay = (share: ShareListItem) => {
    if (!share.expired_at) {
      return ''; // 永久显示空
    }
    
    if (share.is_expired) {
      return t('share.expired');
    }
    
    // 显示过期日期
    const expiryDate = new Date(share.expired_at);
    return expiryDate.toISOString().split('T')[0]; // YYYY-MM-DD 格式
  };


  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('common.loadFailed')}</h3>
            <p className="text-muted-foreground mb-4">{t('share.loadFailed')}</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['shares'] })}>
              {t('common.retry')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (<CustomSkeleton type="table" rows={6} columns={6} />);
  }

  if (!shares || shares.length === 0) {
    return (
      <EmptyList
        icon={Share2}
        title={t('share.noShares')}
        description={t('share.noSharesDescription')}
        className="p-0"
      />
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('project.name')}</TableHead>
              <TableHead>{t('package.name')}</TableHead>
              <TableHead>{t('release.version')}</TableHead>
              <TableHead>{t('share.shareCode')}</TableHead>
              <TableHead>{t('common.createdAt')}</TableHead>
              <TableHead>{t('share.expiryTime')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shares.map((share) => {
              const expiryDisplay = getExpiryDisplay(share);
              return (
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
                  <TableCell className="text-sm">
                    {expiryDisplay && (
                      <span className={expiryDisplay === t('share.expired') ? 'text-destructive' : 'text-muted-foreground'}>
                        {expiryDisplay}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewClick(share)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        title={t('share.viewShare')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteClick(share)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        title={t('share.deleteShare')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}