export interface BadgeResponseDto {
  badgeId: number;
  name: string;
  iconUrl: string;
  description: string | null;
  isOwned: boolean;
  expiredAt?: string | null;
}

export interface UserProfile {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  bio: string | null;
  birthday: string | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  createdAt: string;
  soldCount?: number;
  sellingCount?: number;
  followerCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  badgeId?: number | null;
  badge?: BadgeResponseDto | null;
}

export interface UpdateProfileDto {
  fullName: string;
  phone?: string;
  birthday?: string;
  gender?: string;
  address?: string;
  city?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface UserSummaryDto {
  userId: number;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  followerCount: number;
  isFollowing: boolean;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}
