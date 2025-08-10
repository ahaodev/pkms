import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function NoPermissionsPage() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md">
                <CardContent className="flex flex-col items-center text-center p-8">
                    <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        暂未开放任何资源
                    </h2>
                    <p className="text-gray-600">
                        请联系管理员
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}