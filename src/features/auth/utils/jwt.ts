import { jwtDecode } from 'jwt-decode';
import { User } from '../types';

// Đối tượng mã hóa của JWT từ phía Backend .NET
interface DecodedTokenPayload {
  sub: string;
  email: string;
  unique_name: string;
  fullname?: string;
  role?: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;
  permission?: string | string[];
  avatar_url?: string;
}

/**
 * Giải mã Access Token thành User Object
 */
export const decodeJwtToUser = (token: string): User => {
  const decoded = jwtDecode<DecodedTokenPayload>(token);
  
  // Trích xuất vai trò từ claim chuẩn hoặc claim đặc thù của Microsoft .NET Core
  const role = decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || 'User';
  
  // Trích xuất quyền hạn (permissions) hỗ trợ cả dạng chuỗi đơn lẻ hoặc mảng chuỗi
  const permissions = Array.isArray(decoded.permission)
    ? decoded.permission
    : decoded.permission
    ? [decoded.permission]
    : [];

  const name = decoded.fullname || decoded.unique_name || decoded.email || 'User';
  const avatar = name ? name[0].toUpperCase() : 'U';

  return {
    id: decoded.sub ? parseInt(decoded.sub, 10) : 0,
    email: decoded.email || '',
    username: decoded.unique_name || '',
    role,
    permissions,
    name,
    avatar,
    avatarUrl: decoded.avatar_url,
  };
};
