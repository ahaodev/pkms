import { Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReleaseHeaderProps {
  onCreateRelease: () => void;
  onGoBack?: () => void;
  title: string;
  description: string;
  showBackButton?: boolean;
}

export function ReleaseHeader({ 
  onCreateRelease, 
  onGoBack, 
  title, 
  description, 
  showBackButton = false 
}: ReleaseHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {showBackButton && onGoBack && (
          <Button variant="ghost" size="sm" onClick={onGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
        )}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
      <Button onClick={onCreateRelease}>
        <Plus className="mr-2 h-4 w-4" />
        新建发布
      </Button>
    </div>
  );
}