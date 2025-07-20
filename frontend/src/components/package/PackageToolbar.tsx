import {PackageFilterControls} from './package-filter-controls';

interface PackageToolbarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    selectedType: string;
    onTypeChange: (value: string) => void;
    viewMode: 'grid' | 'list';
    onViewModeChange: (mode: 'grid' | 'list') => void;
    packageCounts: {
        total: number;
        android: number;
        web: number;
        desktop: number;
        linux: number;
        other: number;
    };
    isFiltering: boolean;
}

export function PackageToolbar(props: PackageToolbarProps) {
    return (
        <div className="mb-4">
            <PackageFilterControls {...props} />
        </div>
    );
} 