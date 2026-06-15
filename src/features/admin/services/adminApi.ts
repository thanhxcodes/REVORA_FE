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

export const getAdminUsersAPI = async (params: { page?: number, pageSize?: number, search?: string, roleId?: number, isActive?: boolean }) => {
    const response = await authClient.get('/Admin/Users', { params });
    return response.data;
};

export const toggleUserStatusAPI = async (userId: string | number, isActive: boolean, reason: string) => {
    const response = await authClient.patch(`/Admin/Users/${userId}/status`, { isActive, reason });
    return response.data;
};

export const getUserTransactionsAPI = async (userId: string | number, params?: { page?: number, pageSize?: number }) => {
    const response = await authClient.get(`/Admin/Users/${userId}/transactions`, { params });
    return response.data;
};

export const getUserOverviewAPI = async (userId: string | number) => {
    const response = await authClient.get(`/Admin/Users/${userId}/overview`);
    return response.data;
};
