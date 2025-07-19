import {Plus} from 'lucide-react';
import {Button} from '@/components/ui/button';

interface ProjectHeaderProps {
    onCreateProject: () => void;
}

export function ProjectHeader({onCreateProject}: ProjectHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">项目管理</h1>
                <p className="text-muted-foreground">管理您的软件项目和包</p>
            </div>
            <Button onClick={onCreateProject}>
                <Plus className="mr-2 h-4 w-4"/>
                新建项目
            </Button>
        </div>
    );
}
