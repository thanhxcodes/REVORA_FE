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
  responseRate?: number;
}

export interface UpdateProfileDto {
  fullName: string;
  phone?: string;
  birthday?: string;
  gender?: string;
  address?: string;
  city?: string;
  bio?: string;
}


