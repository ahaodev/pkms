import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useI18n } from '@/contexts/i18n-context';

export default function NoPermissionsPage() {
    const { t } = useI18n();
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md">
                <CardContent className="flex flex-col items-center text-center p-8">
                    <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {t('noPermission.title')}
                    </h2>
                    <p className="text-gray-600">
                        {t('noPermission.description')}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}