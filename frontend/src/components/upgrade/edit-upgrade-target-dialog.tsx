import {Button} from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Switch} from '@/components/ui/switch';
import {Textarea} from '@/components/ui/textarea';
import {UpdateUpgradeTargetRequest} from '@/lib/api/upgrade';

interface EditUpgradeTargetDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    formData: UpdateUpgradeTargetRequest;
    setFormData: React.Dispatch<React.SetStateAction<UpdateUpgradeTargetRequest>>;
    isLoading: boolean;
}

export function EditUpgradeTargetDialog({
                                            isOpen,
                                            onClose,
                                            onSubmit,
                                            formData,
                                            setFormData,
                                            isLoading
                                        }: EditUpgradeTargetDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>编辑升级目标</DialogTitle>
                    <DialogDescription>
                        修改升级目标的名称、描述和状态
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">升级目标名称</Label>
                        <Input
                            id="name"
                            placeholder="输入升级目标名称"
                            value={formData.name || ''}
                            onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">描述</Label>
                        <Textarea
                            id="description"
                            placeholder="描述此升级目标的用途..."
                            value={formData.description || ''}
                            onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                            rows={3}
                        />
                    </div>

                    {/* Is Active */}
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="is_active"
                            checked={formData.is_active ?? true}
                            onCheckedChange={(checked) => setFormData(prev => ({...prev, is_active: checked}))}
                        />
                        <Label htmlFor="is_active">激活状态</Label>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        取消
                    </Button>
                    <Button onClick={onSubmit} disabled={isLoading}>
                        {isLoading ? '保存中...' : '保存'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}