import authClient from '../../../providers/authProvider/authService';

export const getAllProductsForAdminAPI = async () => {
    const response = await authClient.get('/Admin/Products');
    return response.data;
};

export const updateProductStatusAPI = async (productId: string | number, status: string, note?: string) => {
    const response = await authClient.put(`/Admin/Products/${productId}/status`, { status, note });
    return response.data;
};
