import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrandLogo } from '@/components/ui/brand-logo';

interface LoginCardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function LoginCard({ 
  children, 
  title = "PKMS", 
  description = "包管理系统 - 轻松管理您的软件包",
  className 
}: LoginCardProps) {
  return (
    <Card className={`w-full max-w-md ${className || ''}`}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          <BrandLogo showText={false} />
        </div>
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
