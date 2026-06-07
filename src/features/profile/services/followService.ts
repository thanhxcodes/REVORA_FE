import { authClient } from '../../../providers/authProvider/authService';
import { ApiResponse } from '../../auth/types';
import { UserSummaryDto, PagedResult } from '../types';

/**
 * Toggle follow status for a user
 * @param userId ID of the user to follow/unfollow
 */
export const toggleFollowAPI = async (userId: number): Promise<ApiResponse<{ isFollowing: boolean }>> => {
  const response = await authClient.post<ApiResponse<{ isFollowing: boolean }>>(`/users/${userId}/toggle-follow`);
  return response.data;
};

/**
 * Get the followers of a user
 * @param userId ID of the user
 * @param pageNumber Page number
 * @param pageSize Page size
 */
export const getFollowersAPI = async (
  userId: number,
  pageNumber: number = 1,
  pageSize: number = 10
): Promise<ApiResponse<PagedResult<UserSummaryDto>>> => {
  const response = await authClient.get<ApiResponse<PagedResult<UserSummaryDto>>>(
    `/users/${userId}/followers`,
    { params: { pageNumber, pageSize } }
  );
  return response.data;
};

/**
 * Get the users that a user is following
 * @param userId ID of the user
 * @param pageNumber Page number
 * @param pageSize Page size
 */
export const getFollowingAPI = async (
  userId: number,
  pageNumber: number = 1,
  pageSize: number = 10
): Promise<ApiResponse<PagedResult<UserSummaryDto>>> => {
  const response = await authClient.get<ApiResponse<PagedResult<UserSummaryDto>>>(
    `/users/${userId}/following`,
    { params: { pageNumber, pageSize } }
  );
  return response.data;
};
