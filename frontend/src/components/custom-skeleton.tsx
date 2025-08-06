import {Skeleton} from '@/components/ui/skeleton';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';

interface SkeletonProps {
    type?: 'grid' | 'table' | 'list' | 'dashboard';
    rows?: number;
    columns?: number;
    showHeader?: boolean;
}

export function CustomSkeleton({ 
    type = 'grid', 
    rows = 6, 
    columns = 3, 
    showHeader = true 
}: SkeletonProps = {}) {
    
    // 表格骨架
    if (type === 'table') {
        return (
            <div className="rounded-md border">
                <Table>
                    {showHeader && (
                        <TableHeader>
                            <TableRow>
                                {Array.from({length: columns}).map((_, index) => (
                                    <TableHead key={index}>
                                        <Skeleton className="h-4 w-20"/>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                    )}
                    <TableBody>
                        {Array.from({length: rows}).map((_, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {Array.from({length: columns}).map((_, colIndex) => (
                                    <TableCell key={colIndex}>
                                        <Skeleton className="h-4 w-full"/>
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }
    
    // 列表骨架 (竖直排列)
    if (type === 'list') {
        return (
            <div className="space-y-4">
                {Array.from({length: rows}).map((_, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-5 w-32"/>
                            <Skeleton className="h-4 w-16"/>
                        </div>
                        <Skeleton className="h-4 w-full"/>
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-4 w-20"/>
                            <Skeleton className="h-4 w-20"/>
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    
    // 仪表板骨架
    if (type === 'dashboard') {
        return (
            <div className="space-y-6">
                {/* 统计卡片行 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({length: 4}).map((_, index) => (
                        <div key={index} className="border rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-4 w-20"/>
                                <Skeleton className="h-4 w-4 rounded"/>
                            </div>
                            <Skeleton className="h-8 w-16 mt-4"/>
                            <Skeleton className="h-3 w-24 mt-2"/>
                        </div>
                    ))}
                </div>
                
                {/* 图表区域 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-6">
                        <Skeleton className="h-5 w-32 mb-4"/>
                        <Skeleton className="h-64 w-full"/>
                    </div>
                    <div className="border rounded-lg p-6">
                        <Skeleton className="h-5 w-32 mb-4"/>
                        <div className="space-y-3">
                            {Array.from({length: 5}).map((_, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <Skeleton className="h-4 w-24"/>
                                    <Skeleton className="h-4 w-16"/>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    // 网格骨架 (默认)
    return (
        <div className={`grid grid-cols-1 ${columns >= 2 ? 'md:grid-cols-2' : ''} ${columns >= 3 ? 'lg:grid-cols-3' : ''} gap-6`}>
            {Array.from({length: rows}).map((_, index) => (
                <div key={index} className="space-y-3">
                    <Skeleton className="h-[200px] w-full rounded-lg"/>
                </div>
            ))}
        </div>
    );
}