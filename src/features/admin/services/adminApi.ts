import authClient from '../../../providers/authProvider/authService';

export const getAllProductsForAdminAPI = async () => {
    const response = await authClient.get('/Admin/Products');
    return response.data;
};

export const updateProductStatusAPI = async (productId: string | number, status: string, note?: string) => {
    const response = await authClient.put(`/Admin/Products/${productId}/status`, { status, note });
    return response.data;
};

export const sendNotificationsAPI = async (data: { type: string, target: string, title: string, content: string, scheduledAt?: string, specificUserIds?: number[] }) => {
    const response = await authClient.post('/Admin/send-notifications', data);
    return response.data;
};

export const searchUsersAPI = async (query: string) => {
    const response = await authClient.get(`/Admin/Users/search?query=${encodeURIComponent(query)}`);
    return response.data;
};
