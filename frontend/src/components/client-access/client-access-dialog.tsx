import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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

const createSchema = z.object({
  project_id: z.string().min(1, '请选择项目'),
  package_id: z.string().min(1, '请选择包'),
  name: z.string().min(1, '请输入名称').max(255, '名称不能超过255个字符'),
  description: z.string().optional(),
  expires_at: z.date().optional(),
});

const updateSchema = z.object({
  name: z.string().min(1, '请输入名称').max(255, '名称不能超过255个字符'),
  description: z.string().optional(),
  is_active: z.boolean(),
  expires_at: z.date().optional(),
});

type CreateFormData = z.infer<typeof createSchema>;
type UpdateFormData = z.infer<typeof updateSchema>;

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
  const isEdit = !!clientAccess;
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const { data: projects = [] } = useProjects();
  const packagesResult = usePackages({
    projectId: selectedProjectId || undefined
  });
  const packages = packagesResult?.data?.data || [];

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
            {isEdit ? '编辑接入凭证' : '创建接入凭证'}
          </DialogTitle>
          <DialogDescription>
            {isEdit 
              ? '修改客户端接入凭证的配置信息'
              : '为指定的项目和包创建客户端接入凭证'
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
                    <FormLabel>名称 *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="输入接入凭证名称"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      用于标识此接入凭证的名称
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
                    <FormLabel>描述</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="输入描述信息（可选）"
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
                      <FormLabel className="text-base">启用状态</FormLabel>
                      <FormDescription>
                        禁用后客户端将无法使用此令牌
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
                  取消
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? '处理中...' : '更新'}
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
                    <FormLabel>项目 *</FormLabel>
                    <Select 
                      onValueChange={handleProjectChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择项目" />
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
                    <FormLabel>包 *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={!selectedProjectId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择包" />
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
                      请先选择项目
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
                    <FormLabel>名称 *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="输入接入凭证名称"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      用于标识此接入凭证的名称
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
                    <FormLabel>描述</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="输入描述信息（可选）"
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
                  取消
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? '处理中...' : '创建'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}