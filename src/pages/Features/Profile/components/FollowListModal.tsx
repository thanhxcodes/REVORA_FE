import { useState, useEffect, useRef } from 'react';
import { X, UserPlus, Check, Loader2 } from 'lucide-react';
import { UserSummaryDto } from '../../../../features/profile/types';
import { useFollowers, useFollowing, useToggleFollow } from '../../../../features/profile/hooks/useFollow';
import { useAuth } from '../../../../providers/authProvider/AuthContext';
import { Link } from 'react-router-dom';

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  type: 'followers' | 'following';
  onFollowToggle?: (targetUserId: number, isFollowing: boolean) => void;
  variant?: 'modal' | 'sidebar';
}

export default function FollowListModal({ isOpen, onClose, userId, type, onFollowToggle, variant = 'modal' }: FollowListModalProps) {
  const [page, setPage] = useState(1);
  const [localList, setLocalList] = useState<UserSummaryDto[]>([]);
  const { currentUser } = useAuth();

  // We only fetch when the modal is open
  const fetchUserId = isOpen ? userId : null;
  
  const { data: followersData, isLoading: followersLoading, error: followersError } = useFollowers(
    type === 'followers' ? fetchUserId : null,
    page,
    10
  );
  
  const { data: followingData, isLoading: followingLoading, error: followingError } = useFollowing(
    type === 'following' ? fetchUserId : null,
    page,
    10
  );

  const { toggleFollow, isLoading: toggleLoading } = useToggleFollow();
  const [loadingToggleId, setLoadingToggleId] = useState<number | null>(null);

  const data = type === 'followers' ? followersData : followingData;
  const isLoading = type === 'followers' ? followersLoading : followingLoading;
  const error = type === 'followers' ? followersError : followingError;

  const observerTarget = useRef<HTMLDivElement | null>(null);

  // Sync data to local state to allow optimistic updates when following/unfollowing
  useEffect(() => {
    if (data?.items) {
      setLocalList(prev => {
        if (page === 1) return data.items;
        // Avoid duplicates
        const newItems = data.items.filter(item => !prev.some(p => p.userId === item.userId));
        return [...prev, ...newItems];
      });
    }
  }, [data, page]);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && data && page < data.totalPages && !isLoading) {
          setPage(p => p + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [data, isLoading, page]);

  // Reset page when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setPage(1);
      setLocalList([]);
    }
  }, [isOpen]);

  const handleToggleFollow = async (targetUserId: number) => {
    setLoadingToggleId(targetUserId);
    const result = await toggleFollow(targetUserId);
    if (result) {
      // Update local state to reflect the change immediately
      setLocalList((prev) =>
        prev.map((user) =>
          user.userId === targetUserId
            ? { ...user, isFollowing: result.isFollowing }
            : user
        )
      );
      if (onFollowToggle) {
        onFollowToggle(targetUserId, result.isFollowing);
      }
    }
    setLoadingToggleId(null);
  };

  if (!isOpen) return null;

  const isSidebar = variant === 'sidebar';

  return (
    <>
      {/* Overlay */}
      {!isSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 transition-opacity" 
          onClick={onClose} 
        />
      )}
      
      {/* Container */}
      <div className={
        isSidebar 
          ? "fixed top-16 bottom-0 left-20 w-80 bg-white border-l border-gray-200 shadow-2xl z-40 flex flex-col transform transition-transform duration-300" 
          : "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none"
      }>
        <div 
          className={
            isSidebar
              ? "w-full h-full flex flex-col bg-white overflow-hidden pointer-events-auto"
              : "bg-white rounded-3xl shadow-2xl max-w-lg w-full flex flex-col max-h-[85vh] overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 pointer-events-auto"
          }
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className={isSidebar ? "text-[16px] font-bold text-gray-900" : "text-xl font-bold text-gray-900"}>
              {type === 'followers' ? 'Follower' : 'Đang Follow'} {data && <span className="text-gray-500 font-medium text-sm ml-1">({data.totalCount})</span>}
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-2">
            {isLoading && page === 1 ? (
              <div className="space-y-1 p-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="w-[100px] h-[32px] rounded-full bg-gray-200 shrink-0"></div>
                  </div>
                ))}
              </div>
            ) : error && page === 1 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <p className="text-red-500 mb-2">{error}</p>
                <button 
                  onClick={() => setPage(1)} 
                  className="text-[#2D5A3D] font-medium hover:underline"
                >
                  Thử lại
                </button>
              </div>
            ) : localList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <UserPlus className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-900 font-medium mb-1">Không có ai ở đây</p>
                <p className="text-gray-500 text-sm">
                  {type === 'followers' 
                    ? 'Chưa có ai theo dõi.' 
                    : 'Bạn chưa theo dõi ai.'}
                </p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {localList.map((user) => (
                  <div key={user.userId} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-2xl transition-colors">
                    {/* Avatar */}
                    <Link to={`/profile/${user.userId}`} onClick={onClose} className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-[#2D5A3D] text-white flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                        ) : (
                          user.fullName.charAt(0).toUpperCase()
                        )}
                      </div>
                    </Link>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/profile/${user.userId}`} onClick={onClose} className="hover:underline">
                        <h4 className="text-sm font-bold text-gray-900 truncate">{user.fullName}</h4>
                      </Link>
                      <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                      {user.bio && (
                        <p className="text-xs text-gray-600 truncate mt-0.5">{user.bio}</p>
                      )}
                    </div>
                    
                    {/* Action */}
                    {currentUser?.id !== user.userId && (
                      isSidebar ? (
                        <Link
                          to={`/profile/${user.userId}`}
                          onClick={onClose}
                          className="flex-shrink-0 flex items-center justify-center px-4 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors"
                        >
                          Xem
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleToggleFollow(user.userId)}
                          disabled={loadingToggleId === user.userId || toggleLoading}
                          className={`flex-shrink-0 flex items-center justify-center px-4 py-2 rounded-full text-xs font-semibold transition-all min-w-[100px] ${
                            user.isFollowing
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white hover:shadow-md'
                          } disabled:opacity-50`}
                        >
                          {loadingToggleId === user.userId ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : user.isFollowing ? (
                            <>Đã Follow</>
                          ) : (
                            <>Theo dõi</>
                          )}
                        </button>
                      )
                    )}
                  </div>
                ))}
                
                {/* Infinite Scroll Target */}
                {data && page < data.totalPages && (
                  <div ref={observerTarget} className="py-4 flex justify-center">
                    <Loader2 className="w-6 h-6 text-[#2D5A3D] animate-spin" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
