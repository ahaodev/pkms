import {Grid3X3, List} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';

interface ProjectToolbarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    viewMode: 'grid' | 'list';
    onViewModeChange: (mode: 'grid' | 'list') => void;
}

export function ProjectToolbar({
                                   searchTerm,
                                   onSearchChange,
                                   viewMode,
                                   onViewModeChange
                               }: ProjectToolbarProps) {
    return (
        <div className="flex items-center justify-between space-x-2">
            <Input
                placeholder="搜索项目..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="max-w-sm"
            />
            <div className="flex items-center space-x-1">
                <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onViewModeChange('grid')}
                    title="网格视图"
                >
                    <Grid3X3 className="h-4 w-4"/>
                </Button>
                <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onViewModeChange('list')}
                    title="列表视图"
                >
                    <List className="h-4 w-4"/>
                </Button>
            </div>
        </div>
    );
}
