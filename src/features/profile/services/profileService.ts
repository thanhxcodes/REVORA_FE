import { authClient } from '../../../providers/authProvider/authService';
import { ApiResponse } from '../../auth/types';
import { UserProfile, UpdateProfileDto, BadgeResponseDto } from '../types';

/**
 * Fetch the currently authenticated user's profile
 * @param signal AbortSignal to cancel pending requests
 */
export const getMyProfileAPI = async (signal?: AbortSignal): Promise<ApiResponse<UserProfile>> => {
  const response = await authClient.get<ApiResponse<UserProfile>>('/users/me', { signal });
  return response.data;
};

/**
 * Fetch a specific user's profile
 * @param userId ID of the user
 * @param signal AbortSignal to cancel pending requests
 */
export const getUserProfileAPI = async (userId: number, signal?: AbortSignal): Promise<ApiResponse<UserProfile>> => {
  const response = await authClient.get<ApiResponse<UserProfile>>(`/users/${userId}`, { signal });
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

/**
 * Fetch all available badges
 */
export const getBadgesAPI = async (): Promise<ApiResponse<BadgeResponseDto[]>> => {
  const response = await authClient.get<ApiResponse<BadgeResponseDto[]>>('/users/badges');
  return response.data;
};

/**
 * Update active badge for current user
 */
export const updateMyBadgeAPI = async (badgeId: number | null): Promise<ApiResponse<UserProfile>> => {
  const response = await authClient.put<ApiResponse<UserProfile>>('/users/me/badge', { badgeId });
  return response.data;
};

