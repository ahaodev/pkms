import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {ReactNode} from "react";

interface PermissionsTabsProps {
    defaultValue?: string;
    roleManagementContent: ReactNode;
    userManagementContent: ReactNode;
}

export function PermissionsTabs({
                                    defaultValue = "role-management",
                                    roleManagementContent,
                                    userManagementContent
                                }: PermissionsTabsProps) {
    return (
        <Tabs defaultValue={defaultValue} className="space-y-4">
            <TabsList className="grid grid-cols-2">
                <TabsTrigger value="role-management">角色管理</TabsTrigger>
                <TabsTrigger value="user-management">用户管理</TabsTrigger>
            </TabsList>

            <TabsContent value="role-management" className="space-y-4">
                {roleManagementContent}
            </TabsContent>

            <TabsContent value="user-management" className="space-y-4">
                {userManagementContent}
            </TabsContent>
        </Tabs>
    );
}