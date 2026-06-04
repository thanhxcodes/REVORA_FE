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

