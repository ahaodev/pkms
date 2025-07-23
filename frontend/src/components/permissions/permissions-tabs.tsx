import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode } from "react";

interface PermissionsTabsProps {
    defaultValue?: string;
    rolePermissionsContent: ReactNode;
    userRolesContent: ReactNode;
    userPermissionsContent: ReactNode;
}

export function PermissionsTabs({
    defaultValue = "role-permissions",
    rolePermissionsContent,
    userRolesContent,
    userPermissionsContent
}: PermissionsTabsProps) {
    return (
        <Tabs defaultValue={defaultValue} className="space-y-4">
            <TabsList className="grid grid-cols-3">
                <TabsTrigger value="role-permissions">角色权限配置</TabsTrigger>
                <TabsTrigger value="user-roles">用户角色分配</TabsTrigger>
                <TabsTrigger value="user-permissions">用户权限配置</TabsTrigger>
            </TabsList>

            <TabsContent value="role-permissions" className="space-y-4">
                {rolePermissionsContent}
            </TabsContent>

            <TabsContent value="user-roles" className="space-y-4">
                {userRolesContent}
            </TabsContent>

            <TabsContent value="user-permissions" className="space-y-4">
                {userPermissionsContent}
            </TabsContent>
        </Tabs>
    );
}