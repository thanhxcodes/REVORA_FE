import { Home, Video, ChevronDown, ChevronUp, Flame, Trophy, Grid3x3, Users, Package } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isLoggedIn?: boolean;
}

const followedUsers = [
  { username: 'fashionista_22', avatar: 'F', isOnline: true, badge: { icon: '⭐', gradient: 'from-[#2D5A3D] to-[#3D7054]' } },
  { username: 'vintage_style', avatar: 'V', isOnline: true, badge: { icon: '🏆', gradient: 'from-orange-500 to-red-500' } },
  { username: 'sneaker_head', avatar: 'S', isOnline: false, badge: { icon: '✓', gradient: 'from-blue-500 to-blue-600' } },
  { username: 'luxury_deals', avatar: 'L', isOnline: true, badge: { icon: '👑', gradient: 'from-yellow-500 to-amber-600' } },
  { username: 'thrift_queen', avatar: 'T', isOnline: false, badge: { icon: '💎', gradient: 'from-purple-500 to-pink-500' } },
  { username: 'style_maven', avatar: 'M', isOnline: true, badge: null },
  { username: 'bag_collector', avatar: 'B', isOnline: false, badge: null },
  { username: 'streetwear_vn', avatar: 'S', isOnline: true, badge: { icon: '🌱', gradient: 'from-green-500 to-emerald-600' } },
  { username: 'minimal_closet', avatar: 'M', isOnline: false, badge: null },
  { username: 'retro_fashion', avatar: 'R', isOnline: true, badge: { icon: '⭐', gradient: 'from-[#2D5A3D] to-[#3D7054]' } },
];

export default function Sidebar({ isOpen, onToggle, isLoggedIn = true }: SidebarProps) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const [showAllFollowing, setShowAllFollowing] = useState(false);

  const visibleFollowing = showAllFollowing ? followedUsers : followedUsers.slice(0, 7);

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
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white z-50 transition-all duration-300 shadow-lg overflow-y-auto ${isOpen ? 'w-64' : 'w-20'
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
              {isOpen && <span>Trang Chủ</span>}
            </Link>

            <Link
              to="/all-products"
              className={`flex items-center space-x-4 px-6 py-3 transition-colors relative ${isActive('/all-products')
                ? 'bg-gradient-to-r from-[#2D5A3D]/10 to-[#3D7054]/10 text-[#2D5A3D] border-l-4 border-[#2D5A3D]'
                : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              <Grid3x3 className="w-6 h-6 flex-shrink-0" />
              {isOpen && <span>Khám Phá</span>}
            </Link>

            <Link
              to="/shorts"
              className={`flex items-center space-x-4 px-6 py-3 transition-colors relative ${isActive('/shorts')
                ? 'bg-gradient-to-r from-[#2D5A3D]/10 to-[#3D7054]/10 text-[#2D5A3D] border-l-4 border-[#2D5A3D]'
                : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              <Video className="w-6 h-6 flex-shrink-0" />
              {isOpen && <span>Shorts</span>}
            </Link>
            <Link
              to="/ranking"
              className={`flex items-center space-x-4 px-6 py-3 transition-colors relative group ${isActive('/ranking')
                ? 'bg-gradient-to-r from-[#C4603A]/10 to-[#2D5A3D]/10 text-[#C4603A] border-l-4 border-[#C4603A]'
                : 'text-gray-700 hover:bg-gradient-to-r hover:from-[#C4603A]/5 hover:to-[#2D5A3D]/5'
                }`}
            >
              <Trophy className={`w-6 h-6 flex-shrink-0 ${isActive('/ranking') ? 'text-[#C4603A] animate-pulse' : 'group-hover:text-[#C4603A]'}`} />
              {isOpen && (
                <span className={`${isActive('/ranking') ? 'bg-gradient-to-r from-[#C4603A] to-[#2D5A3D] bg-clip-text text-transparent font-semibold' : ''}`}>
                  BXH Tuần
                </span>
              )}
              {isOpen && !isActive('/ranking') && (
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
              <Flame className={`w-6 h-6 flex-shrink-0 mt-0.5 ${isActive('/match') ? 'text-orange-500 animate-pulse' : 'group-hover:text-orange-500'}`} />
              {isOpen && (
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between">
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
          {isOpen && isLoggedIn && (
            <div className="py-4 border-b border-gray-200">
              <div className="px-6 mb-2">
                <h3 className="text-xs text-gray-500 uppercase tracking-wider">Đang Theo Dõi</h3>
              </div>
              {visibleFollowing.map((user) => (
                <Link
                  key={user.username}
                  to={`/user/${user.username}`}
                  className="flex items-center space-x-3 px-6 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-full flex items-center justify-center text-white text-xs">
                      {user.avatar}
                    </div>
                    {user.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-sm truncate">{user.username}</span>
                    {user.badge && (
                      <div
                        className={`w-5 h-5 bg-gradient-to-r ${user.badge.gradient} rounded-full flex items-center justify-center text-white text-[10px] flex-shrink-0`}
                        title="Badge"
                      >
                        {user.badge.icon}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
              {followedUsers.length > 7 && (
                <button
                  onClick={() => setShowAllFollowing(!showAllFollowing)}
                  className="flex items-center justify-center space-x-2 w-full px-6 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  {showAllFollowing ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      <span>Thu Gọn</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      <span>Xem Thêm {followedUsers.length - 7}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Spacer for content */}
      <div className={`transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`} />
    </>
  );
}
