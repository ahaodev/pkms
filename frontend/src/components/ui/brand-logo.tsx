import { Package } from 'lucide-react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
};

const iconSizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function BrandLogo({ size = 'md', showText = true, className }: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className || ''}`}>
      <div className={`flex items-center justify-center rounded-full bg-primary text-primary-foreground ${sizeClasses[size]}`}>
        <Package className={iconSizeClasses[size]} />
      </div>
      {showText && (
        <div className="text-center">
          <h1 className="text-2xl font-bold">PKMS</h1>
          <p className="text-sm text-muted-foreground">包管理系统</p>
        </div>
      )}
    </div>
  );
}
