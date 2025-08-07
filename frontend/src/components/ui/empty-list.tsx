import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface EmptyListProps {
  /** Icon to display (from Lucide React) */
  icon?: LucideIcon;
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
  /** Action button text or React element */
  actionText?: string | React.ReactNode;
  /** Action button click handler */
  onAction?: () => void;
  /** Whether to show action button */
  showAction?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function EmptyList({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  showAction = false,
  className = ''
}: EmptyListProps) {
  return (
    <Card className={className}>
      <CardContent className="flex items-center justify-center py-8">
        <div className="text-center space-y-2">
          {Icon && <Icon className="h-12 w-12 text-muted-foreground mx-auto" />}
          {title && (
            <div className="text-muted-foreground">
              {title}
            </div>
          )}
          {description && (
            <div className="text-sm text-muted-foreground">
              {description}
            </div>
          )}
          {showAction && actionText && onAction && (
            <Button onClick={onAction} className="mt-4">
              {actionText}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}