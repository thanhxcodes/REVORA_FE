// ==========================================
// In-Memory Access Token Storage Service
// ==========================================

let _accessToken: string | null = null;

/**
 * Lấy Access Token từ RAM
 */
export const getAccessToken = (): string | null => _accessToken;

/**
 * Thiết lập Access Token trong RAM
 */
export const setAccessToken = (token: string | null): void => {
  _accessToken = token;
};

/**
 * Xóa sạch Access Token khỏi RAM (Đăng xuất / Hết hạn)
 */
export const clearAccessToken = (): void => {
  _accessToken = null;
};
