import { PageHeader } from '@/components/ui/page-header';

interface SettingsHeaderProps {
    title: string;
    description: string;
}

export function SettingsHeader({ title, description }: SettingsHeaderProps) {
    return (
        <PageHeader
            title={title}
            description={description}
        />
    );
}
