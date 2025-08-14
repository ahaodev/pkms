import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useI18n } from '@/contexts/i18n-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useProjects } from '@/hooks/use-projects';
import { usePackages } from '@/hooks/use-packages';
import type { ClientAccess, CreateClientAccessRequest, UpdateClientAccessRequest } from '@/types/client-access';

// Create base schemas that will be used for type inference
const baseCreateSchema = z.object({
  project_id: z.string().min(1),
  package_id: z.string().min(1),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  expires_at: z.date().optional(),
});

const baseUpdateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  is_active: z.boolean(),
  expires_at: z.date().optional(),
});

type CreateFormData = z.infer<typeof baseCreateSchema>;
type UpdateFormData = z.infer<typeof baseUpdateSchema>;

interface ClientAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientAccess?: ClientAccess;
  onSubmit: (data: CreateClientAccessRequest | UpdateClientAccessRequest) => Promise<void>;
  loading?: boolean;
}

export function ClientAccessDialog({
  open,
  onOpenChange,
  clientAccess,
  onSubmit,
  loading = false,
}: ClientAccessDialogProps) {
  const { t } = useI18n();
  const isEdit = !!clientAccess;
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const { data: projects = [] } = useProjects();
  const packagesResult = usePackages({
    projectId: selectedProjectId || undefined
  });
  const packages = packagesResult?.data?.data || [];

  // Create schemas with translations
  const createSchema = z.object({
    project_id: z.string().min(1, t('clientAccess.projectRequired')),
    package_id: z.string().min(1, t('clientAccess.packageRequired')),
    name: z.string().min(1, t('clientAccess.nameRequired')).max(255, t('clientAccess.nameMaxLength')),
    description: z.string().optional(),
    expires_at: z.date().optional(),
  });

  const updateSchema = z.object({
    name: z.string().min(1, t('clientAccess.nameRequired')).max(255, t('clientAccess.nameMaxLength')),
    description: z.string().optional(),
    is_active: z.boolean(),
    expires_at: z.date().optional(),
  });

  const createForm = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      project_id: '',
      package_id: '',
      name: '',
      description: '',
    },
  });

  const updateForm = useForm<UpdateFormData>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      name: '',
      description: '',
      is_active: true,
    },
  });

  // 重置表单
  useEffect(() => {
    if (open) {
      if (isEdit && clientAccess) {
        updateForm.reset({
          name: clientAccess.name,
          description: clientAccess.description || '',
          is_active: clientAccess.is_active,
          expires_at: clientAccess.expires_at ? new Date(clientAccess.expires_at) : undefined,
        });
      } else {
        createForm.reset({
          project_id: '',
          package_id: '',
          name: '',
          description: '',
          expires_at: undefined,
        });
        setSelectedProjectId('');
      }
    }
  }, [open, isEdit, clientAccess, createForm, updateForm]);

  // 监听项目选择变化
  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    createForm.setValue('project_id', projectId);
    createForm.setValue('package_id', ''); // 重置包选择
  };

  const handleCreateSubmit = async (data: CreateFormData) => {
    try {
      await onSubmit({
        project_id: data.project_id,
        package_id: data.package_id,
        name: data.name,
        description: data.description || undefined,
        expires_at: data.expires_at?.toISOString(),
      });
      onOpenChange(false);
    } catch {
      // 错误处理在hook中完成
    }
  };

  const handleUpdateSubmit = async (data: UpdateFormData) => {
    try {
      await onSubmit({
        name: data.name,
        description: data.description || undefined,
        is_active: data.is_active,
        expires_at: data.expires_at?.toISOString(),
      });
      onOpenChange(false);
    } catch {
      // 错误处理在hook中完成
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('clientAccess.edit') : t('clientAccess.create')}
          </DialogTitle>
          <DialogDescription>
            {isEdit 
              ? t('clientAccess.editDescription')
              : t('clientAccess.createDescription')
            }
          </DialogDescription>
        </DialogHeader>

        {isEdit ? (
          <Form {...updateForm}>
            <form onSubmit={updateForm.handleSubmit(handleUpdateSubmit)} className="space-y-6">
              {/* 名称 */}
              <FormField
                control={updateForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('clientAccess.name')} *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('clientAccess.namePlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('clientAccess.nameDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 描述 */}
              <FormField
                control={updateForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('common.description')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('clientAccess.descriptionPlaceholder')}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 启用状态 */}
              <FormField
                control={updateForm.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t('clientAccess.enableStatus')}</FormLabel>
                      <FormDescription>
                        {t('clientAccess.disabledDescription')}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* 过期时间 */}
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? t('clientAccess.processing') : t('common.update')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-6">
              {/* 项目选择 */}
              <FormField
                control={createForm.control}
                name="project_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('clientAccess.project')} *</FormLabel>
                    <Select 
                      onValueChange={handleProjectChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('clientAccess.selectProject')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 包选择 */}
              <FormField
                control={createForm.control}
                name="package_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('clientAccess.package')} *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={!selectedProjectId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('clientAccess.selectPackage')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {packages.map((pkg) => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            {pkg.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {t('clientAccess.selectProjectFirst')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 名称 */}
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('clientAccess.name')} *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('clientAccess.namePlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('clientAccess.nameDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 描述 */}
              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('common.description')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('clientAccess.descriptionPlaceholder')}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 过期时间 */}
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? t('clientAccess.processing') : t('common.create')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}