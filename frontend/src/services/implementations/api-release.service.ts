import {ReleaseService} from '@/services/interfaces/release-service.interface';
import {Release, ReleaseFilters, ApiResponse, PaginatedResponse} from '@/types';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.delivery-system.com';
const API_VERSION = 'v1';

class ApiClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = `${API_BASE_URL}/api/${API_VERSION}`;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseUrl}${endpoint}`;

        const defaultHeaders = {
            'Content-Type': 'application/json',
            // Add authorization header here when auth is implemented
            // 'Authorization': `Bearer ${token}`,
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...defaultHeaders,
                    ...options.headers,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    data: data as T,
                    success: false,
                    message: data.message || 'An error occurred',
                    errors: data.errors || [response.statusText],
                };
            }

            return {
                data: data as T,
                success: true,
                message: data.message,
            };
        } catch (error) {
            return {
                data: {} as T,
                success: false,
                message: 'Network error',
                errors: [error instanceof Error ? error.message : 'Unknown error'],
            };
        }
    }

    async get<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {method: 'GET'});
    }

    async post<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async patch<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {method: 'DELETE'});
    }
}

export class ApiReleaseService implements ReleaseService {
    private apiClient: ApiClient;

    constructor() {
        this.apiClient = new ApiClient();
    }

    async getReleases(filters?: ReleaseFilters): Promise<ApiResponse<PaginatedResponse<Release>>> {
        const queryParams = new URLSearchParams();

        if (filters) {
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.type) queryParams.append('type', filters.type);
            if (filters.environment) queryParams.append('environment', filters.environment);
            if (filters.author) queryParams.append('author', filters.author);
            if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom.toISOString());
            if (filters.dateTo) queryParams.append('dateTo', filters.dateTo.toISOString());
        }

        const endpoint = `/releases${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        return this.apiClient.get<PaginatedResponse<Release>>(endpoint);
    }

    async getRelease(id: string): Promise<ApiResponse<Release>> {
        return this.apiClient.get<Release>(`/releases/${id}`);
    }

    async createRelease(release: Omit<Release, 'id' | 'createdAt'>): Promise<ApiResponse<Release>> {
        return this.apiClient.post<Release>('/releases', release);
    }

    async updateRelease(id: string, release: Partial<Release>): Promise<ApiResponse<Release>> {
        return this.apiClient.patch<Release>(`/releases/${id}`, release);
    }

    async deleteRelease(id: string): Promise<ApiResponse<void>> {
        return this.apiClient.delete<void>(`/releases/${id}`);
    }

    async promoteRelease(id: string, targetEnvironment: Release['environment']): Promise<ApiResponse<Release>> {
        return this.apiClient.post<Release>(`/releases/${id}/promote`, {
            targetEnvironment,
        });
    }

    async approveRelease(id: string): Promise<ApiResponse<Release>> {
        return this.apiClient.post<Release>(`/releases/${id}/approve`, {});
    }

    async rejectRelease(id: string, reason: string): Promise<ApiResponse<Release>> {
        return this.apiClient.post<Release>(`/releases/${id}/reject`, {
            reason,
        });
    }
}

export default ApiClient;
