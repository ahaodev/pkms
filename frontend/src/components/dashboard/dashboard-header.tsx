import { PageHeader } from '@/components/ui/page-header';

interface DashboardHeaderProps {
    title: string;
    description: string;
}

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
    return (
        <PageHeader
            title={title}
            description={description}
        />
    );
}
