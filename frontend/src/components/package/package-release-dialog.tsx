import { useState } from 'react';
import { Smartphone, Globe, Monitor, Server, Package2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Package, PackageUpload, UploadProgress, Project } from '@/types/simplified';
import { formatFileSize, getProjectIcon } from './package-utils';

interface PackageReleaseDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (data: PackageUpload) => Promise<void>;
  projects?: Project[];
  uploadProgress?: UploadProgress | null;
  isUploading: boolean;
  initialProjectId?: string;
}

export function PackageReleaseDialog({
  open,
  onClose,
  onUpload,
  projects,
  uploadProgress,
  isUploading,
  initialProjectId = ''
}: PackageReleaseDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<Omit<PackageUpload, 'file'>>({
    projectId: initialProjectId,
    name: '',
    description: '',
    type: 'android',
    version: '',
    changelog: '',
  });

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      await onUpload({
        ...formData,
        file: selectedFile
      });
      
      // 重置表单
      setSelectedFile(null);
      setFormData({
        projectId: initialProjectId,
        name: '',
        description: '',
        type: 'android',
        version: '',
        changelog: '',
      });
    } catch (error) {
      // 错误处理由父组件负责
      console.error(error);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFile(null);
      setFormData({
        projectId: initialProjectId,
        name: '',
        description: '',
        type: 'android',
        version: '',
        changelog: '',
      });
      onClose();
    }
  };

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
            <Label htmlFor="project">项目</Label>
            <Select 
              value={formData.projectId} 
              onValueChange={(value) => setFormData({ ...formData, projectId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择项目" />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center">
                      {getProjectIcon(project.icon || 'package2')}
                      <span className="ml-2">{project.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="file">文件</Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              disabled={isUploading}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground mt-1">
                {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="name">包名称</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="输入包名称"
              disabled={isUploading}
            />
          </div>

          <div>
            <Label htmlFor="type">类型</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: Package['type']) => setFormData({ ...formData, type: value })}
              disabled={isUploading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="android">
                  <div className="flex items-center">
                    <Smartphone className="mr-2 h-4 w-4" />
                    Android
                  </div>
                </SelectItem>
                <SelectItem value="web">
                  <div className="flex items-center">
                    <Globe className="mr-2 h-4 w-4" />
                    Web
                  </div>
                </SelectItem>
                <SelectItem value="desktop">
                  <div className="flex items-center">
                    <Monitor className="mr-2 h-4 w-4" />
                    Desktop
                  </div>
                </SelectItem>
                <SelectItem value="linux">
                  <div className="flex items-center">
                    <Server className="mr-2 h-4 w-4" />
                    Linux
                  </div>
                </SelectItem>
                <SelectItem value="other">
                  <div className="flex items-center">
                    <Package2 className="mr-2 h-4 w-4" />
                    Other
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="version">版本号</Label>
            <Input
              id="version"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              placeholder="1.0.0"
              disabled={isUploading}
            />
          </div>

          <div>
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="包描述"
              disabled={isUploading}
            />
          </div>

          <div>
            <Label htmlFor="changelog">更新日志</Label>
            <Textarea
              id="changelog"
              value={formData.changelog}
              onChange={(e) => setFormData({ ...formData, changelog: e.target.value })}
              placeholder="此版本的更新内容"
              disabled={isUploading}
            />
          </div>

          {uploadProgress && (
            <div>
              <Label>上传进度</Label>
              <Progress value={uploadProgress.percentage} className="mt-2" />
              <p className="text-sm text-muted-foreground mt-1">
                {uploadProgress.percentage.toFixed(1)}% 
                ({formatFileSize(uploadProgress.loaded)} / {formatFileSize(uploadProgress.total)})
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            取消
          </Button>
          <Button 
            onClick={handleUpload}
            disabled={!selectedFile || !formData.name || !formData.version || isUploading}
          >
            {isUploading ? '上传中...' : '上传'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
