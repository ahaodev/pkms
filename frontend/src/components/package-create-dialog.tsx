import {useState} from 'react';
import {Globe, Monitor, Package2, Server, Smartphone} from 'lucide-react';
import {Button} from '@/components/ui/button.tsx';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog.tsx';
import {Label} from '@/components/ui/label.tsx';
import {Input} from '@/components/ui/input.tsx';
import {Textarea} from '@/components/ui/textarea.tsx';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select.tsx';
import {Package} from '@/types/package.ts';
import {createPackage} from "@/lib/api";
import {toast} from '@/hooks/use-toast.ts';

interface PackageCreateDialogProps {
    open: boolean;
    onClose: () => void;
    projectID: string;
}

export function PackageCreateDialog({
                                        open,
                                        onClose,
                                        projectID,
                                    }: PackageCreateDialogProps) {
    const [formData, setFormData] = useState<{
        projectId: string;
        name: string;
        description: string;
        type: Package['type'];
    }>({
        projectId: projectID,
        name: '',
        description: '',
        type: 'android',
    });
    const handleClose = () => {
        setFormData({
            projectId: projectID,
            name: '',
            description: '',
            type: 'android',
        });
        onClose();
    };

    function handleCreate() {

        createPackage(formData)
            .then(response => {
                if (response.code == 0) {
                    toast({
                        title: '包创建成功',
                        description: `包 "${formData.name}" 已成功创建。`,
                    });
                    handleClose();
                } else {
                    toast({
                        title: '创建失败',
                        description: response.msg || '请稍后再试。',
                        variant: 'destructive'
                    });
                }
            }).catch(error => {
            console.error('创建包失败:', error);
            toast({
                title: '创建失败',
                description: '包创建失败，请稍后再试。',
                variant: 'destructive'
            });
        })
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>创建新包</DialogTitle>
                    <DialogDescription>
                        上传一个新的软件包版本。
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name">包名称</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="输入包名称"
                        />
                    </div>

                    <div>
                        <Label htmlFor="type">程序类型</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value: Package['type']) => setFormData({...formData, type: value})}
                        >
                            <SelectTrigger>
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="android">
                                    <div className="flex items-center">
                                        <Smartphone className="mr-2 h-4 w-4"/>
                                        Android
                                    </div>
                                </SelectItem>
                                <SelectItem value="web">
                                    <div className="flex items-center">
                                        <Globe className="mr-2 h-4 w-4"/>
                                        Web
                                    </div>
                                </SelectItem>
                                <SelectItem value="desktop">
                                    <div className="flex items-center">
                                        <Monitor className="mr-2 h-4 w-4"/>
                                        Desktop
                                    </div>
                                </SelectItem>
                                <SelectItem value="linux">
                                    <div className="flex items-center">
                                        <Server className="mr-2 h-4 w-4"/>
                                        Linux
                                    </div>
                                </SelectItem>
                                <SelectItem value="other">
                                    <div className="flex items-center">
                                        <Package2 className="mr-2 h-4 w-4"/>
                                        Other
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="description">描述</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="包描述"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={false}>
                        取消
                    </Button>
                    <Button type="submit" disabled={!formData.name || !formData.projectId || !formData.type}
                            onClick={handleCreate}>
                        {'创建'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
