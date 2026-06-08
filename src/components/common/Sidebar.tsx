import { Home, Video, ChevronDown, ChevronUp, Flame, Trophy, Grid3x3, Users, Package, List, MessageCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isLoggedIn?: boolean;
}

import { useAuth } from '../../providers/authProvider/AuthContext';
import { useFollowing } from '../../features/profile/hooks/useFollow';
import FollowListModal from '../../pages/Features/Profile/components/FollowListModal';

export default function Sidebar({ isOpen, onToggle, isLoggedIn = true }: SidebarProps) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const actualIsOpen = isFollowModalOpen ? false : isOpen;

  const { currentUser } = useAuth();
  const { data: followingData } = useFollowing(currentUser?.id || null, 1, 100);
  
  const followedUsers = followingData?.items?.filter(u => u.isFollowing !== false) || [];
  const visibleFollowing = followedUsers.slice(0, 5);

  // Synchronized virtual stats from localStorage and custom events
  const [participants, setParticipants] = useState(() => {
    return Number(localStorage.getItem('revora_match_participants')) || 982;
  });
  const [products, setProducts] = useState(() => {
    return Number(localStorage.getItem('revora_match_products')) || 2516;
  });

  useEffect(() => {
    const handleUpdate = () => {
      setParticipants(Number(localStorage.getItem('revora_match_participants')) || 982);
      setProducts(Number(localStorage.getItem('revora_match_products')) || 2516);
    };
    window.addEventListener('revora_match_stats_updated', handleUpdate);

    // Initial load
    handleUpdate();

    let timer: ReturnType<typeof setInterval> | null = null;
    if (location.pathname !== '/match') {
      timer = setInterval(() => {
        setParticipants((prev) => {
          const delta = Math.floor(Math.random() * 5) - 2;
          const nextVal = Math.max(10, prev + delta);
          localStorage.setItem('revora_match_participants', String(nextVal));
          return nextVal;
        });
        setProducts((prev) => {
          const delta = Math.floor(Math.random() * 7) - 3;
          const nextVal = Math.max(10, prev + delta);
          localStorage.setItem('revora_match_products', String(nextVal));
          return nextVal;
        });
      }, 3500);
    }

    return () => {
      window.removeEventListener('revora_match_stats_updated', handleUpdate);
      if (timer) clearInterval(timer);
    };
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Overlay */}
      {actualIsOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white z-50 transition-all duration-300 shadow-lg overflow-y-auto ${actualIsOpen ? 'w-64' : 'w-20'
          }`}
      >
        <div className="flex flex-col">
          {/* Group 1: Home + Shorts + All Products + Ranking + Match */}
          <nav className="py-4 border-b border-gray-200">
            <Link
              to="/"
              className={`flex items-center space-x-4 px-6 py-3 transition-colors relative ${isActive('/')
                ? 'bg-gradient-to-r from-[#2D5A3D]/10 to-[#3D7054]/10 text-[#2D5A3D] border-l-4 border-[#2D5A3D]'
                : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              <Home className="w-6 h-6 flex-shrink-0" />
              {actualIsOpen && <span>Trang Chủ</span>}
            </Link>

            <Link
              to="/all-products"
              className={`flex items-center space-x-4 px-6 py-3 transition-colors relative ${isActive('/all-products')
                ? 'bg-gradient-to-r from-[#2D5A3D]/10 to-[#3D7054]/10 text-[#2D5A3D] border-l-4 border-[#2D5A3D]'
                : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              <Grid3x3 className="w-6 h-6 flex-shrink-0" />
              {actualIsOpen && <span>Sản Phẩm</span>}
            </Link>

            <Link
              to="/shorts"
              className={`flex items-center space-x-4 px-6 py-3 transition-colors relative ${isActive('/shorts')
                ? 'bg-gradient-to-r from-[#2D5A3D]/10 to-[#3D7054]/10 text-[#2D5A3D] border-l-4 border-[#2D5A3D]'
                : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              <Video className="w-6 h-6 flex-shrink-0" />
              {actualIsOpen && <span>Shorts</span>}
            </Link>

            <Link
              to="/ranking"
              className={`flex items-center space-x-4 px-6 py-3 transition-colors relative group ${isActive('/ranking')
                ? 'bg-gradient-to-r from-[#C4603A]/10 to-[#2D5A3D]/10 text-[#C4603A] border-l-4 border-[#C4603A]'
                : 'text-gray-700 hover:bg-gradient-to-r hover:from-[#C4603A]/5 hover:to-[#2D5A3D]/5'
                }`}
            >
              <Trophy className={`w-6 h-6 flex-shrink-0 ${isActive('/ranking') ? 'text-[#C4603A] animate-pulse' : 'group-hover:text-[#C4603A]'}`} />
              {actualIsOpen && (
                <span className={`${isActive('/ranking') ? 'bg-gradient-to-r from-[#C4603A] to-[#2D5A3D] bg-clip-text text-transparent font-semibold' : ''}`}>
                  BXH Tuần
                </span>
              )}
              {actualIsOpen && !isActive('/ranking') && (
                <span className="text-[10px] font-bold bg-gradient-to-r from-[#C4603A] to-[#2D5A3D] text-white px-1.5 py-0.5 rounded-full animate-pulse">
                  NEW
                </span>
              )}
            </Link>
            <Link
              to="/match"
              className={`flex items-start space-x-4 px-6 py-3 transition-colors relative group ${isActive('/match')
                ? 'bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-600 border-l-4 border-orange-500'
                : 'text-gray-700 hover:bg-gradient-to-r hover:from-orange-500/5 hover:to-red-500/5'
                }`}
            >
              <Flame className={`w-6 h-6 flex-shrink-0 ${isActive('/match') ? 'text-orange-500 animate-pulse' : 'group-hover:text-orange-500'}`} />
              {actualIsOpen && (
                <div className="flex flex-col w-full">
                  <div className="flex items-center justify-between w-full">
                    <span className={`font-semibold ${isActive('/match') ? 'bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent' : ''}`}>
                      REVORA MATCH
                    </span>
                    {!isActive('/match') && (
                      <span className="text-[10px] font-bold bg-gradient-to-r from-orange-400 to-red-500 text-white px-1.5 py-0.5 rounded-full animate-pulse">
                        HOT
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-500">
                    <div className="flex items-center gap-1 animate-fade-in">
                      <Users className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                      <span>{participants.toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center gap-1 animate-fade-in">
                      <Package className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
                      <span>{products.toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
              )}
            </Link>
          </nav>

          {/* Group 2: Following */}
          {actualIsOpen && isLoggedIn && (
            <div className="py-4 border-b border-gray-200">
              <div className="px-6 mb-2">
                <h3 className="text-xs text-gray-500 uppercase tracking-wider">Đang Theo Dõi</h3>
              </div>
              {visibleFollowing.map((user) => (
                <Link
                  key={user.userId}
                  to={`/profile/${user.userId}`}
                  className="flex items-center space-x-3 px-6 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-full flex items-center justify-center text-white text-xs overflow-hidden">
                      {user.avatarUrl && user.avatarUrl.length > 1 ? (
                        <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        (user.fullName || user.username).charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-sm truncate">{user.username}</span>
                  </div>
                </Link>
              ))}
              {followedUsers.length > 5 && (
                <button
                  onClick={() => setIsFollowModalOpen(true)}
                  className="flex items-center space-x-3 w-full px-6 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors group"
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50 group-hover:bg-white transition-colors">
                      <List className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="font-medium text-[13px] tracking-wide">Xem tất cả</span>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Spacer for content */}
      <div className={`transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`} />
      
      <FollowListModal
        isOpen={isFollowModalOpen}
        onClose={() => setIsFollowModalOpen(false)}
        userId={currentUser?.id || 0}
        type="following"
        variant="sidebar"
      />
    </>
  );
}
