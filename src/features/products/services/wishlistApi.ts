import { authClient } from '../../../providers/authProvider/authService';

export const toggleWishlistAPI = async (productId: number) => {
  const response = await authClient.post(`/wishlists/toggle/${productId}`);
  return response.data;
};

export const getMyWishlistAPI = async () => {
  const response = await authClient.get('/wishlists/me');
  return response.data;
};

export const getMyWishlistIdsAPI = async () => {
  const response = await authClient.get('/wishlists/my-ids');
  return response.data;
};
