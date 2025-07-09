import {ReleaseService} from '@/services/interfaces/release-service.interface';
import {Release, ReleaseFilters, ApiResponse, PaginatedResponse} from '@/types';
import {mockReleases} from '@/data/mock-releases';

export class MockReleaseService implements ReleaseService {
    private releases: Release[] = [...mockReleases];

    async getReleases(filters?: ReleaseFilters): Promise<ApiResponse<PaginatedResponse<Release>>> {
        // Simulate API delay
        await this.delay(300);

        let filteredReleases = [...this.releases];

        if (filters) {
            if (filters.status) {
                filteredReleases = filteredReleases.filter(release => release.status === filters.status);
            }
            if (filters.type) {
                filteredReleases = filteredReleases.filter(release => release.type === filters.type);
            }
            if (filters.environment) {
                filteredReleases = filteredReleases.filter(release => release.environment === filters.environment);
            }
            if (filters.author) {
                filteredReleases = filteredReleases.filter(release =>
                    release.author.toLowerCase().includes(filters.author!.toLowerCase())
                );
            }
            if (filters.dateFrom) {
                filteredReleases = filteredReleases.filter(release => release.createdAt >= filters.dateFrom!);
            }
            if (filters.dateTo) {
                filteredReleases = filteredReleases.filter(release => release.createdAt <= filters.dateTo!);
            }
        }

        // Sort by creation date (newest first)
        filteredReleases.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return {
            data: {
                data: filteredReleases,
                pagination: {
                    page: 1,
                    limit: 50,
                    total: filteredReleases.length,
                    pages: 1
                }
            },
            success: true
        };
    }

    async getRelease(id: string): Promise<ApiResponse<Release>> {
        await this.delay(200);

        const release = this.releases.find(r => r.id === id);
        if (!release) {
            return {
                data: {} as Release,
                success: false,
                message: 'Release not found',
                errors: ['Release with the specified ID does not exist']
            };
        }

        return {
            data: release,
            success: true
        };
    }

    async createRelease(releaseData: Omit<Release, 'id' | 'createdAt'>): Promise<ApiResponse<Release>> {
        await this.delay(500);

        const newRelease: Release = {
            ...releaseData,
            id: (this.releases.length + 1).toString(),
            createdAt: new Date()
        };

        this.releases.push(newRelease);

        return {
            data: newRelease,
            success: true,
            message: 'Release created successfully'
        };
    }

    async updateRelease(id: string, updates: Partial<Release>): Promise<ApiResponse<Release>> {
        await this.delay(300);

        const releaseIndex = this.releases.findIndex(r => r.id === id);
        if (releaseIndex === -1) {
            return {
                data: {} as Release,
                success: false,
                message: 'Release not found',
                errors: ['Release with the specified ID does not exist']
            };
        }

        this.releases[releaseIndex] = {...this.releases[releaseIndex], ...updates};

        return {
            data: this.releases[releaseIndex],
            success: true,
            message: 'Release updated successfully'
        };
    }

    async deleteRelease(id: string): Promise<ApiResponse<void>> {
        await this.delay(200);

        const releaseIndex = this.releases.findIndex(r => r.id === id);
        if (releaseIndex === -1) {
            return {
                data: undefined,
                success: false,
                message: 'Release not found',
                errors: ['Release with the specified ID does not exist']
            };
        }

        this.releases.splice(releaseIndex, 1);

        return {
            data: undefined,
            success: true,
            message: 'Release deleted successfully'
        };
    }

    async promoteRelease(id: string, targetEnvironment: Release['environment']): Promise<ApiResponse<Release>> {
        await this.delay(400);

        const releaseIndex = this.releases.findIndex(r => r.id === id);
        if (releaseIndex === -1) {
            return {
                data: {} as Release,
                success: false,
                message: 'Release not found',
                errors: ['Release with the specified ID does not exist']
            };
        }

        this.releases[releaseIndex].environment = targetEnvironment;
        this.releases[releaseIndex].status = 'ready';

        return {
            data: this.releases[releaseIndex],
            success: true,
            message: `Release promoted to ${targetEnvironment} successfully`
        };
    }

    async approveRelease(id: string): Promise<ApiResponse<Release>> {
        await this.delay(300);

        const releaseIndex = this.releases.findIndex(r => r.id === id);
        if (releaseIndex === -1) {
            return {
                data: {} as Release,
                success: false,
                message: 'Release not found',
                errors: ['Release with the specified ID does not exist']
            };
        }

        this.releases[releaseIndex].status = 'ready';

        return {
            data: this.releases[releaseIndex],
            success: true,
            message: 'Release approved successfully'
        };
    }

    async rejectRelease(id: string, reason: string): Promise<ApiResponse<Release>> {
        await this.delay(300);

        const releaseIndex = this.releases.findIndex(r => r.id === id);
        if (releaseIndex === -1) {
            return {
                data: {} as Release,
                success: false,
                message: 'Release not found',
                errors: ['Release with the specified ID does not exist']
            };
        }

        this.releases[releaseIndex].status = 'failed';
        this.releases[releaseIndex].description += ` (Rejected: ${reason})`;

        return {
            data: this.releases[releaseIndex],
            success: true,
            message: 'Release rejected'
        };
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
