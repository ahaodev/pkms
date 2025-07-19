import {
    Pagination,
    PaginationContent,
    PaginationLink,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis,
} from '@/components/ui/pagination';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';

interface PackagePaginationProps {
    page: number;
    pageSize: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

export function PackagePagination({
                                      page,
                                      pageSize,
                                      totalPages,
                                      onPageChange,
                                      onPageSizeChange
                                  }: PackagePaginationProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-end py-2 gap-3 border-t bg-background">
            <Select value={pageSize.toString()} onValueChange={v => onPageSizeChange(Number(v))}>
                <SelectTrigger className="w-24">
                    <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                    {[10, 20, 50, 100].map(size => (
                        <SelectItem key={size} value={size.toString()}>{size} 条/页</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => page > 1 && onPageChange(page - 1)}
                            aria-disabled={page <= 1}
                            tabIndex={page <= 1 ? -1 : 0}
                        />
                    </PaginationItem>

                    {Array.from({length: totalPages}).map((_, idx) => {
                        if (
                            idx + 1 === 1 ||
                            idx + 1 === totalPages ||
                            Math.abs(idx + 1 - page) <= 2
                        ) {
                            return (
                                <PaginationItem key={idx}>
                                    <PaginationLink
                                        isActive={page === idx + 1}
                                        onClick={() => onPageChange(idx + 1)}
                                    >
                                        {idx + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            );
                        }
                        if (
                            (idx + 1 === page - 3 && page - 3 > 1) ||
                            (idx + 1 === page + 3 && page + 3 < totalPages)
                        ) {
                            return (
                                <PaginationItem key={idx}>
                                    <PaginationEllipsis/>
                                </PaginationItem>
                            );
                        }
                        return null;
                    })}

                    <PaginationItem>
                        <PaginationNext
                            onClick={() => page < totalPages && onPageChange(page + 1)}
                            aria-disabled={page >= totalPages}
                            tabIndex={page >= totalPages ? -1 : 0}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
} 