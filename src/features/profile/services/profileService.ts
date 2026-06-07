import { authClient } from '../../../providers/authProvider/authService';
import { ApiResponse } from '../../auth/types';
import { UserProfile, UpdateProfileDto } from '../types';

/**
 * Fetch the currently authenticated user's profile
 * @param signal AbortSignal to cancel pending requests
 */
export const getMyProfileAPI = async (signal?: AbortSignal): Promise<ApiResponse<UserProfile>> => {
  const response = await authClient.get<ApiResponse<UserProfile>>('/users/me', { signal });
  return response.data;
};

/**
 * Update the currently authenticated user's profile
 * @param data profile update data DTO
 */
export const updateMyProfileAPI = async (data: UpdateProfileDto): Promise<ApiResponse<UserProfile>> => {
  const response = await authClient.put<ApiResponse<UserProfile>>('/users/me', data);
  return response.data;
};

/**
 * Upload user's avatar image
 * @param file image file
 */
export const uploadAvatarAPI = async (file: File): Promise<{ success: boolean; message: string; url?: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await authClient.post('/media/upload-avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

