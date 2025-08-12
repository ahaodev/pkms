import { apiClient } from './api';

export interface ShareListItem {
  id: string;
  code: string;
  project_name: string;
  package_name: string;
  version: string;
  file_name: string;
  share_url: string;
  start_at: string;
  expired_at?: string;
  is_expired: boolean;
}

export interface CreateShareRequest {
  release_id: string;
  expiry_hours: number;
}

export interface UpdateShareExpiryRequest {
  expiry_hours: number;
}

export interface ShareResponse {
  id: string;
  code: string;
  share_url: string;
  release_id: string;
  expiry_hours: number;
  file_name: string;
  version: string;
  start_at: string;
  expired_at?: string;
}

export const sharesApi = {
  // Get all shares for current tenant
  getAll: async (): Promise<ShareListItem[]> => {
    const response = await apiClient.get('/api/v1/shares');
    return response.data.data;
  },

  // Create a new share
  create: async (request: CreateShareRequest): Promise<ShareResponse> => {
    const response = await apiClient.post(`/api/v1/releases/${request.release_id}/share`, {
      expiry_hours: request.expiry_hours
    });
    return response.data.data;
  },

  // Update share expiry
  updateExpiry: async (id: string, request: UpdateShareExpiryRequest): Promise<ShareResponse> => {
    const response = await apiClient.put(`/api/v1/shares/${id}/expiry`, request);
    return response.data.data;
  },

  // Delete a share
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/shares/${id}`);
  },

  // Download shared file (no auth required)
  downloadShared: (code: string): string => {
    return `/share/${code}`;
  }
};