import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Package } from "lucide-react";
import { useI18n } from "@/contexts/i18n-context";

/**
 * 404 未找到页：展示友好的错误提示和返回入口
 */

export default function NotFound() {
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleGoToDashboard = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="text-center space-y-6 max-w-md animate-in fade-in-50 slide-in-from-bottom-16 duration-500">
        <div className="flex justify-center">
          <Package className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">{t("notFound.title")}</h1>
        <p className="text-muted-foreground">
          {t("notFound.description")}
        </p>
        <div className="flex justify-center space-x-4 pt-4">
          <Button onClick={handleGoBack} variant="outline">
            {t("notFound.goBack")}
          </Button>
          <Button onClick={handleGoToDashboard}>
            {t("notFound.goToDashboard")}
          </Button>
        </div>
      </div>
    </div>
  );
}