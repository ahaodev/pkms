import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DataPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  className?: string;
  pageSizeOptions?: number[];
}

export const DataPagination = React.memo<DataPaginationProps>(({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  showSizeChanger = true,
  showQuickJumper = false,
  className,
  pageSizeOptions = [10, 20, 50, 100]
}) => {
  const [jumpValue, setJumpValue] = React.useState('');

  const handleJump = () => {
    const page = parseInt(jumpValue);
    if (page && page >= 1 && page <= totalPages) {
      onPageChange(page);
      setJumpValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJump();
    }
  };

  const getVisiblePages = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const showPages = 5; // 显示的页码数量

    if (totalPages <= showPages + 2) {
      // 如果总页数较少，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 总是显示第一页
      pages.push(1);

      const start = Math.max(2, currentPage - Math.floor(showPages / 2));
      const end = Math.min(totalPages - 1, start + showPages - 1);

      // 如果开始页不是2，添加省略号
      if (start > 2) {
        pages.push('ellipsis');
      }

      // 添加中间页码
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // 如果结束页不是倒数第二页，添加省略号
      if (end < totalPages - 1) {
        pages.push('ellipsis');
      }

      // 总是显示最后一页
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalItems === 0) {
    return null;
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className={cn('flex items-center justify-between px-2 py-4', className)}>
      {/* 左侧信息 */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          显示第 {startItem}-{endItem} 条，共 {totalItems} 条
        </span>
        
        {showSizeChanger && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span>每页显示</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="w-16 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>条</span>
          </div>
        )}
      </div>

      {/* 右侧分页控件 */}
      <div className="flex items-center gap-4">
        {showQuickJumper && (
          <div className="flex items-center gap-2 text-sm">
            <span>跳至</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpValue}
              onChange={(e) => setJumpValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-12 h-8 px-2 text-center border rounded"
              placeholder="1"
            />
            <span>页</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleJump}
              disabled={!jumpValue}
            >
              确定
            </Button>
          </div>
        )}

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="gap-1 pl-2.5"
              >
                <ChevronLeft className="h-4 w-4" />
                上一页
              </Button>
            </PaginationItem>

            {getVisiblePages().map((page, index) => (
              <PaginationItem key={index}>
                {page === 'ellipsis' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(page);
                    }}
                    isActive={currentPage === page}
                    className="w-9 h-9"
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="gap-1 pr-2.5"
              >
                下一页
                <ChevronRight className="h-4 w-4" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
});

DataPagination.displayName = 'DataPagination';