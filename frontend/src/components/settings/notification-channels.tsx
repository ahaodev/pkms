import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import {Server} from "lucide-react";

interface NotificationChannelsProps {
    onConnectWecom?: () => void;
    onConnectDingTalk?: () => void;
    onConfigureWebhook?: () => void;
}

export function NotificationChannels({
                                         onConnectWecom,
                                         onConnectDingTalk,
                                         onConfigureWebhook
                                     }: NotificationChannelsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>通知渠道</CardTitle>
                <CardDescription>
                    配置其他通知渠道
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/906/906367.png"
                                alt="企业微信"
                                className="h-8 w-8"
                            />
                            <div>
                                <p className="font-medium">企业微信</p>
                                <p className="text-sm text-muted-foreground">
                                    向企业微信群发送通知
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={onConnectWecom}>
                            连接
                        </Button>
                    </div>

                    <Separator/>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/2111/2111418.png"
                                alt="钉钉"
                                className="h-8 w-8"
                            />
                            <div>
                                <p className="font-medium">钉钉</p>
                                <p className="text-sm text-muted-foreground">
                                    向钉钉群发送通知
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={onConnectDingTalk}>
                            连接
                        </Button>
                    </div>

                    <Separator/>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Server className="h-8 w-8 text-muted-foreground"/>
                            <div>
                                <p className="font-medium">Webhook</p>
                                <p className="text-sm text-muted-foreground">
                                    向自定义 Webhook 发送通知
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={onConfigureWebhook}>
                            配置
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
