import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {getProjectIcon, iconOptions as defaultIconOptions} from '@/lib/utils';

interface ProjectFormData {
    name: string;
    description: string;
    icon: string;
}

interface ProjectDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: () => void;
    title: string;
    isEdit?: boolean;
    formData: ProjectFormData;
    setFormData: (data: ProjectFormData) => void;
    iconOptions?: Array<{ value: string; label: string }>;
    isLoading?: boolean;
    project?: any;
    onDelete?: () => void;
    isDeleting?: boolean;
}

export function ProjectDialog({
                                  open,
                                  onClose,
                                  onSubmit,
                                  title,
                                  isEdit = false,
                                  formData,
                                  setFormData,
                                  iconOptions = defaultIconOptions,
                                  isLoading = false,
                                  project,
                                  onDelete,
                                  isDeleting = false
                              }: ProjectDialogProps) {
    const canDelete = isEdit && project && (project.packageCount === 0 || project.packageCount === undefined);
    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            if (!isOpen) {
                onClose();
            }
        }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? '修改项目信息。' : '创建一个新的项目来组织您的软件包。'}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor={isEdit ? "edit-name" : "name"}>项目名称</Label>
                        <Input
                            id={isEdit ? "edit-name" : "name"}
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="输入项目名称"
                        />
                    </div>
                    <div>
                        <Label htmlFor={isEdit ? "edit-description" : "description"}>项目描述</Label>
                        <Textarea
                            id={isEdit ? "edit-description" : "description"}
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="输入项目描述"
                        />
                    </div>
                    <div>
                        <Label>项目图标</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {iconOptions.map((iconOption) => (
                                <Button
                                    key={iconOption.value}
                                    variant={formData.icon === iconOption.value ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setFormData({...formData, icon: iconOption.value})}
                                    className="flex items-center gap-2"
                                >
                                    {getProjectIcon(iconOption.value)}
                                    {iconOption.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter className="flex justify-between">
                    <div>
                        {canDelete && onDelete && (
                            <Button
                                variant="destructive"
                                onClick={onDelete}
                                disabled={isDeleting || isLoading}
                            >
                                {isDeleting ? '删除中...' : '删除项目'}
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>
                            取消
                        </Button>
                        <Button
                            onClick={onSubmit}
                            disabled={!formData.name || isLoading}
                        >
                            {isLoading ? (isEdit ? '更新中...' : '创建中...') : (isEdit ? '更新项目' : '创建项目')}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
