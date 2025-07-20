import {Grid3X3, List} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Badge} from '@/components/ui/badge';
import {getTypeIcon} from './package-utils';

interface PackageFilterControlsProps {
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

export function PackageFilterControls({
                                          searchTerm,
                                          onSearchChange,
                                          selectedType,
                                          onTypeChange,
                                          viewMode,
                                          onViewModeChange,
                                          packageCounts,
                                          isFiltering
                                      }: PackageFilterControlsProps) {
    return (
        <div className="flex flex-wrap gap-4">
            <Input
                placeholder="搜索包名或描述..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="max-w-sm"
            />

            <Select value={selectedType} onValueChange={onTypeChange}>
                <SelectTrigger className="w-40">
                    <SelectValue placeholder="所有类型"/>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">
                        <div className="flex items-center justify-between w-full">
                            <span>所有类型</span>
                            <Badge variant="secondary" className="ml-2 text-xs">
                                {isFiltering ? '...' : packageCounts.total}
                            </Badge>
                        </div>
                    </SelectItem>
                    <SelectItem value="android">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                                {getTypeIcon('android')}
                                <span className="ml-2">Android</span>
                            </div>
                            <Badge variant="secondary" className="ml-2 text-xs">
                                {isFiltering ? '...' : packageCounts.android}
                            </Badge>
                        </div>
                    </SelectItem>
                    <SelectItem value="web">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                                {getTypeIcon('web')}
                                <span className="ml-2">Web</span>
                            </div>
                            <Badge variant="secondary" className="ml-2 text-xs">
                                {isFiltering ? '...' : packageCounts.web}
                            </Badge>
                        </div>
                    </SelectItem>
                    <SelectItem value="desktop">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                                {getTypeIcon('desktop')}
                                <span className="ml-2">Desktop</span>
                            </div>
                            <Badge variant="secondary" className="ml-2 text-xs">
                                {isFiltering ? '...' : packageCounts.desktop}
                            </Badge>
                        </div>
                    </SelectItem>
                    <SelectItem value="linux">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                                {getTypeIcon('linux')}
                                <span className="ml-2">Linux</span>
                            </div>
                            <Badge variant="secondary" className="ml-2 text-xs">
                                {isFiltering ? '...' : packageCounts.linux}
                            </Badge>
                        </div>
                    </SelectItem>
                    <SelectItem value="other">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                                {getTypeIcon('other')}
                                <span className="ml-2">Other</span>
                            </div>
                            <Badge variant="secondary" className="ml-2 text-xs">
                                {isFiltering ? '...' : packageCounts.other}
                            </Badge>
                        </div>
                    </SelectItem>
                </SelectContent>
            </Select>

            <div className="flex-1"/>

            <div className="flex items-center space-x-1">
                <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onViewModeChange('grid')}
                >
                    <Grid3X3 className="h-4 w-4"/>
                </Button>
                <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onViewModeChange('list')}
                >
                    <List className="h-4 w-4"/>
                </Button>
            </div>
        </div>
    );
}
