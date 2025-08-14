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
import {Textarea} from '@/components/ui/textarea';
import {UpdateUpgradeTargetRequest} from '@/lib/api/upgrade';
import {useI18n} from '@/contexts/i18n-context';

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
    const { t } = useI18n();
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t('upgrade.editTarget')}</DialogTitle>
                    <DialogDescription>
                        {t('upgrade.editTargetDescription')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">{t('upgrade.targetName')}</Label>
                        <Input
                            id="name"
                            placeholder={t('upgrade.targetNamePlaceholder')}
                            value={formData.name || ''}
                            onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">{t('common.description')}</Label>
                        <Textarea
                            id="description"
                            placeholder={t('upgrade.descriptionPlaceholder')}
                            value={formData.description || ''}
                            onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                            rows={3}
                        />
                    </div>

                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        {t('common.cancel')}
                    </Button>
                    <Button onClick={onSubmit} disabled={isLoading}>
                        {isLoading ? t('common.saving') : t('common.save')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}