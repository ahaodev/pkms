import {useEffect, useState} from 'react';
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
import {toast} from 'sonner';
import {useI18n} from '@/contexts/i18n-context';

interface PackageCreateDialogProps {
    open: boolean;
    onClose: () => void;
    projectID: string;
    onSuccess?: () => void;
}

export function PackageCreateDialog({
                                        open,
                                        onClose,
                                        projectID,
                                        onSuccess
                                    }: PackageCreateDialogProps) {
    const { t } = useI18n();
    const [formData, setFormData] = useState<{
        projectId: string;
        name: string;
        description: string;
        type: Package['type'];
    }>({
        projectId: projectID || '',
        name: '',
        description: '',
        type: 'android',
    });

    // Update formData.projectId when projectID prop changes
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            projectId: projectID || ''
        }));
    }, [projectID]);

    const handleClose = () => {
        setFormData({
            projectId: projectID || '',
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
                    toast.success(t('package.createSuccess', { name: formData.name }));
                    handleClose();
                    // Call onSuccess callback to refresh the packages list
                    onSuccess?.();
                } else {
                    toast.error(response.msg || t('package.createError'));
                }
            }).catch(error => {
            console.error(t('package.createFailedLog'), error);
            toast.error(t('package.createFailedError'));
        })
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('package.create')}</DialogTitle>
                    <DialogDescription>
                        {t('package.createDescription')}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name">{t('package.name')}</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder={t('package.namePlaceholder')}
                        />
                    </div>

                    <div>
                        <Label htmlFor="type">{t('package.type')}</Label>
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
                        <Label htmlFor="description">{t('package.description')}</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder={t('package.descriptionPlaceholder')}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={false}>
                        {t('common.cancel')}
                    </Button>
                    <Button type="submit" disabled={!formData.name || !formData.projectId || !formData.type}
                            onClick={handleCreate}>
                        {t('common.create')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
