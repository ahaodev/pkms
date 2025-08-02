import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode } from "react";

interface SettingsTabsProps {
    defaultValue?: string;
    accountContent: ReactNode;
}

export function SettingsTabs({
    defaultValue = "account",
    accountContent,
}: SettingsTabsProps) {
    return (
        <Tabs defaultValue={defaultValue} className="space-y-4">
            <TabsList className="grid grid-cols-4">
                <TabsTrigger value="account">账户</TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-4">
                {accountContent}
            </TabsContent>
        </Tabs>
    );
}
