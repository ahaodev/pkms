import { PageHeader } from '@/components/ui/page-header';

interface PermissionsHeaderProps {
    title: string;
    description: string;
}

export function PermissionsHeader({ title, description }: PermissionsHeaderProps) {
    return (
        <PageHeader
            title={title}
            description={description}
        />
    );
}