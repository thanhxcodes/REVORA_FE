export interface RankingUser {
  id: string;
  username: string;
  avatar: string;
  soldCount: number;
  styleScore: number;
  rank: number;
  trendChange: number;
  badge?: string;
  featuredCount: number;
  topProducts: string[];
}

export interface RankingProduct {
  id: string;
  name: string;
  image: string;
  seller: string;
  sellerAvatar: string;
  sales: number;
  likes: number;
  wishlist: number;
  views: number;
  rank: number;
  trending: boolean;
  comments: number;
  score: number;
}

export const MOCK_SELLERS: RankingUser[] = [
  { id: 's1', username: 'Fashion Icon', avatar: '👑', soldCount: 345, styleScore: 980, rank: 1, trendChange: 0, badge: 'Top Seller #1 Weekly', featuredCount: 5, topProducts: ['https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=100', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=100', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=100'] },
  { id: 's2', username: 'Trendsetter', avatar: '✨', soldCount: 280, styleScore: 890, rank: 2, trendChange: 1, badge: 'Top Seller Weekly', featuredCount: 4, topProducts: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=100', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=100', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=100', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100'] },
  { id: 's3', username: 'Vintage Hub', avatar: '🧵', soldCount: 210, styleScore: 750, rank: 3, trendChange: 2, badge: 'Top Seller Weekly', featuredCount: 3, topProducts: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=100', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=100', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=100', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=100'] },
  { id: 's4', username: 'Streetwear VN', avatar: '🔥', soldCount: 190, styleScore: 680, rank: 4, trendChange: -1, featuredCount: 2, topProducts: ['https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=100'] },
  { id: 's5', username: 'Minimalist', avatar: '🌿', soldCount: 150, styleScore: 620, rank: 5, trendChange: 0, featuredCount: 2, topProducts: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=100'] },
  { id: 's6', username: 'Luxury Closet', avatar: '💎', soldCount: 130, styleScore: 590, rank: 6, trendChange: 3, featuredCount: 1, topProducts: ['https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=100'] },
  { id: 's7', username: 'Hypebeast', avatar: '👟', soldCount: 110, styleScore: 540, rank: 7, trendChange: -2, featuredCount: 1, topProducts: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=100'] },
  { id: 's8', username: 'Chic Style', avatar: '👗', soldCount: 95, styleScore: 490, rank: 8, trendChange: 1, featuredCount: 2, topProducts: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=100'] },
  { id: 's9', username: 'OOTD Daily', avatar: '📸', soldCount: 80, styleScore: 430, rank: 9, trendChange: -1, featuredCount: 1, topProducts: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=100'] },
  { id: 's10', username: 'Basic & Beyond', avatar: '👕', soldCount: 70, styleScore: 390, rank: 10, trendChange: 0, featuredCount: 1, topProducts: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100'] },
];

export const MOCK_PRODUCTS: RankingProduct[] = [
  { id: 'p1', name: 'Premium Silk Dress', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500', seller: 'Fashion Icon', sellerAvatar: '👑', sales: 45, likes: 230, wishlist: 120, views: 1500, comments: 45, score: 850, rank: 1, trending: true },
  { id: 'p2', name: 'Classic Leather Jacket', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500', seller: 'Trendsetter', sellerAvatar: '✨', sales: 30, likes: 180, wishlist: 95, views: 1100, comments: 32, score: 720, rank: 2, trending: true },
  { id: 'p3', name: 'Oversized Linen Shirt', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500', seller: 'Vintage Hub', sellerAvatar: '🧵', sales: 25, likes: 140, wishlist: 70, views: 890, comments: 20, score: 560, rank: 3, trending: false },
  { id: 'p4', name: 'Y2K Cargo Pants', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500', seller: 'Streetwear VN', sellerAvatar: '🔥', sales: 22, likes: 120, wishlist: 65, views: 810, comments: 18, score: 510, rank: 4, trending: true },
  { id: 'p5', name: 'Minimalist Watch', image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500', seller: 'Minimalist', sellerAvatar: '🌿', sales: 18, likes: 95, wishlist: 50, views: 600, comments: 12, score: 420, rank: 5, trending: false },
  { id: 'p6', name: 'Designer Handbag', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500', seller: 'Luxury Closet', sellerAvatar: '💎', sales: 15, likes: 110, wishlist: 85, views: 950, comments: 25, score: 400, rank: 6, trending: true },
  { id: 'p7', name: 'Air Jordan 1 Retro', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500', seller: 'Hypebeast', sellerAvatar: '👟', sales: 14, likes: 130, wishlist: 60, views: 1200, comments: 40, score: 380, rank: 7, trending: true },
  { id: 'p8', name: 'Floral Summer Dress', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500', seller: 'Chic Style', sellerAvatar: '👗', sales: 12, likes: 80, wishlist: 45, views: 500, comments: 15, score: 310, rank: 8, trending: false },
  { id: 'p9', name: 'Retro Sunglasses', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500', seller: 'OOTD Daily', sellerAvatar: '📸', sales: 10, likes: 60, wishlist: 30, views: 400, comments: 8, score: 250, rank: 9, trending: false },
  { id: 'p10', name: 'Essential White Tee', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', seller: 'Basic & Beyond', sellerAvatar: '👕', sales: 8, likes: 50, wishlist: 20, views: 300, comments: 5, score: 200, rank: 10, trending: false },
];
