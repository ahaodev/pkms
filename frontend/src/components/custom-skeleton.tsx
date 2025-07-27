import {Skeleton} from '@/components/ui/skeleton';

export function CustomSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({length: 6}).map((_, index) => (
                <div key={index} className="space-y-3">
                    <Skeleton className="h-[200px] w-full rounded-lg"/>
                </div>
            ))}
        </div>
    );
}