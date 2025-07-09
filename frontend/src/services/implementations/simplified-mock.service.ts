import {ProjectService, PackageService} from '@/services/interfaces/simplified';
import {
    Project,
    Package,
    PackageFilters,
    VersionInfo,
    ShareInfo,
    ApiResponse,
    PaginatedResponse,
    PackageUpload,
    UploadProgress
} from '@/types/simplified';
import {mockProjects, mockPackages} from '@/data/simplified-mock';

export class MockProjectService implements ProjectService {
    private projects: Project[] = [...mockProjects];

    async getProjects(): Promise<ApiResponse<Project[]>> {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 300));

        return {
            data: this.projects,
            success: true,
            message: '项目列表获取成功'
        };
    }

    async getProject(id: string): Promise<ApiResponse<Project>> {
        await new Promise(resolve => setTimeout(resolve, 200));

        const project = this.projects.find(p => p.id === id);
        if (!project) {
            return {
                data: {} as Project,
                success: false,
                message: '项目不存在',
                errors: ['Project not found']
            };
        }

        return {
            data: project,
            success: true,
            message: '项目详情获取成功'
        };
    }

    async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'packageCount'>): Promise<ApiResponse<Project>> {
        await new Promise(resolve => setTimeout(resolve, 500));

        const newProject: Project = {
            ...projectData,
            id: Date.now().toString(),
            createdAt: new Date(),
            updatedAt: new Date(),
            packageCount: 0
        };

        this.projects.push(newProject);

        return {
            data: newProject,
            success: true,
            message: '项目创建成功'
        };
    }

    async updateProject(id: string, update: Partial<Project>): Promise<ApiResponse<Project>> {
        await new Promise(resolve => setTimeout(resolve, 400));

        const projectIndex = this.projects.findIndex(p => p.id === id);
        if (projectIndex === -1) {
            return {
                data: {} as Project,
                success: false,
                message: '项目不存在',
                errors: ['Project not found']
            };
        }

        this.projects[projectIndex] = {
            ...this.projects[projectIndex],
            ...update,
            updatedAt: new Date()
        };

        return {
            data: this.projects[projectIndex],
            success: true,
            message: '项目更新成功'
        };
    }

    async deleteProject(id: string): Promise<ApiResponse<void>> {
        await new Promise(resolve => setTimeout(resolve, 300));

        const projectIndex = this.projects.findIndex(p => p.id === id);
        if (projectIndex === -1) {
            return {
                data:undefined,
                success: false,
                message: '项目不存在',
                errors: ['Project not found']
            };
        }

        this.projects.splice(projectIndex, 1);

        return {
            data: undefined,
            success: true,
            message: '项目删除成功'
        };
    }
}

export class MockPackageService implements PackageService {
    private packages: Package[] = [...mockPackages];

    async getPackages(filters?: PackageFilters): Promise<ApiResponse<PaginatedResponse<Package>>> {
        await new Promise(resolve => setTimeout(resolve, 400));

        let filteredPackages = [...this.packages];

        if (filters) {
            if (filters.projectId) {
                filteredPackages = filteredPackages.filter(p => p.projectId === filters.projectId);
            }
            if (filters.type) {
                filteredPackages = filteredPackages.filter(p => p.type === filters.type);
            }
            if (filters.isLatest !== undefined) {
                filteredPackages = filteredPackages.filter(p => p.isLatest === filters.isLatest);
            }
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                filteredPackages = filteredPackages.filter(p =>
                    p.name.toLowerCase().includes(searchLower) ||
                    p.description.toLowerCase().includes(searchLower)
                );
            }
        }

        // 按创建时间降序排序
        filteredPackages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return {
            data: {
                items: filteredPackages,
                total: filteredPackages.length,
                page: 1,
                pageSize: filteredPackages.length,
                totalPages: 1
            },
            success: true,
            message: '包列表获取成功'
        };
    }

    async getPackage(id: string): Promise<ApiResponse<Package>> {
        await new Promise(resolve => setTimeout(resolve, 200));

        const pkg = this.packages.find(p => p.id === id);
        if (!pkg) {
            return {
                data: {} as Package,
                success: false,
                message: '包不存在',
                errors: ['Package not found']
            };
        }

        return {
            data: pkg,
            success: true,
            message: '包详情获取成功'
        };
    }

    async getPackagesByProject(projectId: string): Promise<ApiResponse<Package[]>> {
        await new Promise(resolve => setTimeout(resolve, 300));

        const projectPackages = this.packages.filter(p => p.projectId === projectId);
        projectPackages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return {
            data: projectPackages,
            success: true,
            message: '项目包列表获取成功'
        };
    }

    async uploadPackage(
        upload: PackageUpload,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<ApiResponse<Package>> {
        // 模拟上传进度
        const simulateUpload = async () => {
            for (let i = 0; i <= 100; i += 10) {
                await new Promise(resolve => setTimeout(resolve, 100));
                if (onProgress) {
                    onProgress({
                        loaded: (upload.file.size * i) / 100,
                        total: upload.file.size,
                        percentage: i
                    });
                }
            }
        };

        await simulateUpload();

        // 生成新包
        const newPackage: Package = {
            id: Date.now().toString(),
            projectId: upload.projectId,
            name: upload.name,
            description: upload.description,
            type: upload.type,
            version: upload.version,
            fileUrl: `/downloads/${upload.file.name}`,
            fileName: upload.file.name,
            fileSize: upload.file.size,
            checksum: `sha256:${Math.random().toString(36).substring(2)}`,
            changelog: upload.changelog,
            isLatest: true,
            downloadCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            versionCode: Date.now(),
            shareToken: `share_${upload.type}_${Date.now()}`,
            isPublic: upload.isPublic || false
        };

        // 将同项目同名的其他包标记为非最新
        this.packages.forEach(p => {
            if (p.projectId === upload.projectId && p.name === upload.name) {
                p.isLatest = false;
            }
        });

        this.packages.push(newPackage);

        return {
            data: newPackage,
            success: true,
            message: '包上传成功'
        };
    }

    async updatePackage(id: string, update: Partial<Package>): Promise<ApiResponse<Package>> {
        await new Promise(resolve => setTimeout(resolve, 300));

        const packageIndex = this.packages.findIndex(p => p.id === id);
        if (packageIndex === -1) {
            return {
                data: {} as Package,
                success: false,
                message: '包不存在',
                errors: ['Package not found']
            };
        }

        this.packages[packageIndex] = {
            ...this.packages[packageIndex],
            ...update,
            updatedAt: new Date()
        };

        return {
            data: this.packages[packageIndex],
            success: true,
            message: '包更新成功'
        };
    }

    async deletePackage(id: string): Promise<ApiResponse<void>> {
        await new Promise(resolve => setTimeout(resolve, 300));

        const packageIndex = this.packages.findIndex(p => p.id === id);
        if (packageIndex === -1) {
            return {
                data: undefined,
                success: false,
                message: '包不存在',
                errors: ['Package not found']
            };
        }

        this.packages.splice(packageIndex, 1);

        return {
            data: undefined,
            success: true,
            message: '包删除成功'
        };
    }

    async checkVersion(packageId: string, currentVersion: string): Promise<ApiResponse<VersionInfo>> {
        await new Promise(resolve => setTimeout(resolve, 200));

        const pkg = this.packages.find(p => p.id === packageId);
        if (!pkg) {
            return {
                data: {} as VersionInfo,
                success: false,
                message: '包不存在',
                errors: ['Package not found']
            };
        }

        const hasUpdate = pkg.version !== currentVersion;

        return {
            data: {
                packageId,
                currentVersion,
                latestVersion: pkg.version,
                hasUpdate,
                downloadUrl: hasUpdate ? pkg.fileUrl : undefined,
                changelog: hasUpdate ? pkg.changelog : undefined
            },
            success: true,
            message: '版本检查完成'
        };
    }

    async getVersionHistory(packageId: string): Promise<ApiResponse<Package[]>> {
        await new Promise(resolve => setTimeout(resolve, 300));

        const pkg = this.packages.find(p => p.id === packageId);
        if (!pkg) {
            return {
                data: [],
                success: false,
                message: '包不存在',
                errors: ['Package not found']
            };
        }

        // 获取同名同项目的所有版本
        const versions = this.packages.filter(p =>
            p.projectId === pkg.projectId &&
            p.name === pkg.name
        );

        versions.sort((a, b) => b.versionCode - a.versionCode);

        return {
            data: versions,
            success: true,
            message: '版本历史获取成功'
        };
    }

    async generateShareLink(packageId: string, expiresIn?: number): Promise<ApiResponse<ShareInfo>> {
        await new Promise(resolve => setTimeout(resolve, 200));

        const pkg = this.packages.find(p => p.id === packageId);
        if (!pkg) {
            return {
                data: {} as ShareInfo,
                success: false,
                message: '包不存在',
                errors: ['Package not found']
            };
        }

        const baseUrl = window.location.origin;
        const shareUrl = `${baseUrl}/share/${pkg.shareToken}`;
        const qrCodeUrl = `${baseUrl}/api/qr?url=${encodeURIComponent(shareUrl)}`;

        const shareInfo: ShareInfo = {
            shareUrl,
            qrCodeUrl,
            downloadCount: pkg.downloadCount,
            expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined
        };

        return {
            data: shareInfo,
            success: true,
            message: '分享链接生成成功'
        };
    }

    async getShareInfo(shareToken: string): Promise<ApiResponse<ShareInfo>> {
        await new Promise(resolve => setTimeout(resolve, 200));

        const pkg = this.packages.find(p => p.shareToken === shareToken);
        if (!pkg) {
            return {
                data: {} as ShareInfo,
                success: false,
                message: '分享链接不存在或已过期',
                errors: ['Share token not found']
            };
        }

        // 检查是否过期
        if (pkg.shareExpiry && pkg.shareExpiry < new Date()) {
            return {
                data: {} as ShareInfo,
                success: false,
                message: '分享链接已过期',
                errors: ['Share link expired']
            };
        }

        const baseUrl = window.location.origin;
        const shareUrl = `${baseUrl}/share/${shareToken}`;
        const qrCodeUrl = `${baseUrl}/api/qr?url=${encodeURIComponent(shareUrl)}`;

        return {
            data: {
                shareUrl,
                qrCodeUrl,
                downloadCount: pkg.downloadCount,
                expiresAt: pkg.shareExpiry
            },
            success: true,
            message: '分享信息获取成功'
        };
    }

    async downloadSharedPackage(shareToken: string): Promise<ApiResponse<{ downloadUrl: string }>> {
        await new Promise(resolve => setTimeout(resolve, 100));

        const pkg = this.packages.find(p => p.shareToken === shareToken);
        if (!pkg) {
            return {
                data: {downloadUrl: ''},
                success: false,
                message: '分享链接不存在或已过期',
                errors: ['Share token not found']
            };
        }

        // 检查是否过期
        if (pkg.shareExpiry && pkg.shareExpiry < new Date()) {
            return {
                data: {downloadUrl: ''},
                success: false,
                message: '分享链接已过期',
                errors: ['Share link expired']
            };
        }

        // 增加下载计数
        pkg.downloadCount++;

        return {
            data: {
                downloadUrl: pkg.fileUrl
            },
            success: true,
            message: '下载链接获取成功'
        };
    }
}
