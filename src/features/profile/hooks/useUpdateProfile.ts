import { useState, useCallback } from 'react';
import { updateMyProfileAPI } from '../services/profileService';
import { UpdateProfileDto, UserProfile } from '../types';

export interface UseUpdateProfileResult {
  updateProfile: (data: UpdateProfileDto) => Promise<UserProfile>;
  isUpdating: boolean;
  updateError: string | null;
}

export const useUpdateProfile = (): UseUpdateProfileResult => {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const updateProfile = useCallback(async (data: UpdateProfileDto): Promise<UserProfile> => {
    setIsUpdating(true);
    setUpdateError(null);

    try {
      const response = await updateMyProfileAPI(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Cập nhật thông tin thất bại.');
      }
      return response.data;
    } catch (err: any) {
      console.error('Error in updateProfile hook:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Không thể kết nối đến máy chủ.';
      setUpdateError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return { updateProfile, isUpdating, updateError };
};
