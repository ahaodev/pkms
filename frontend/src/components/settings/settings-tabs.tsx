import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode } from "react";

interface SettingsTabsProps {
  defaultValue?: string;
  storageContent: ReactNode;
  notificationsContent: ReactNode;
}

export function SettingsTabs({
  defaultValue = "storage",
  storageContent,
  notificationsContent
}: SettingsTabsProps) {
  return (
    <Tabs defaultValue={defaultValue} className="space-y-4">
      <TabsList className="grid grid-cols-2">
        <TabsTrigger value="storage">存储</TabsTrigger>
        <TabsTrigger value="notifications">通知</TabsTrigger>
      </TabsList>
      
      <TabsContent value="storage" className="space-y-4">
        {storageContent}
      </TabsContent>
      
      <TabsContent value="notifications" className="space-y-4">
        {notificationsContent}
      </TabsContent>
    </Tabs>
  );
}
