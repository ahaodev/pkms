import {useState} from 'react';
import {Globe, Monitor, Package2, Server, Smartphone} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import {Label} from '@/components/ui/label';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Package, PackageUpload, Project, UploadProgress} from '@/types/simplified';
import {getProjectIcon} from "@/components/project";
import {createPackage} from "@/lib/api";

interface PackageCreateDialogProps {
    open: boolean;
    onClose: () => void;
    projects: Project[] | undefined;
    uploadProgress?: UploadProgress | null;
    initialProjectId?: string;
}

export function PackageCreateDialog({
                                        open,
                                        onClose,
                                        projects,
                                        initialProjectId = ''
                                    }: PackageCreateDialogProps) {
    const [formData, setFormData] = useState<Omit<PackageUpload, 'file'>>({
        projectId: initialProjectId,
        name: '',
        description: '',
        type: 'android',
        version: '',
        changelog: '',
        isPublic: false
    });
    const handleClose = () => {
        setFormData({
            projectId: initialProjectId,
            name: '',
            description: '',
            type: 'android',
            version: '',
            changelog: '',
            isPublic: false
        });
        onClose();
    };

    function handleCreate() {
        createPackage

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
                        <Label htmlFor="project">项目</Label>
                        <Select
                            value={formData.projectId}
                            onValueChange={(value) => setFormData({...formData, projectId: value})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="选择项目"/>
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
                        <Label htmlFor="name">包名称</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="输入包名称"
                        />
                    </div>

                    <div>
                        <Label htmlFor="type">类型</Label>
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
