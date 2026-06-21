import { TrendingUp, Package, ChevronLeft, ChevronRight, Flame, FileText, Award, Clock } from 'lucide-react';
import { useState } from 'react';
import { RankingUser } from './MockData';

interface TopSellerLeaderboardProps {
  sellers: RankingUser[];
}

const ITEMS_PER_PAGE = 5;

function getSellerReward(rank: number) {
  if (rank === 1) return { featured: 30, posting: 15, badge: 'Top Seller #1 Weekly' };
  if (rank === 2) return { featured: 24, posting: 12, badge: 'Top Seller Weekly' };
  if (rank === 3) return { featured: 18, posting: 10, badge: 'Top Seller Weekly' };
  if (rank === 4) return { featured: 16, posting: 8 };
  if (rank === 5) return { featured: 14, posting: 6 };
  if (rank === 6) return { featured: 12, posting: 4 };
  if (rank === 7) return { featured: 10, posting: 4 };
  if (rank === 8) return { featured: 8, posting: 4 };
  if (rank === 9 || rank === 10) return { featured: 6, posting: 2 };
  if (rank >= 11 && rank <= 15) return { featured: 4, posting: 2 };
  if (rank >= 16 && rank <= 20) return { featured: 2, posting: 2 };
  return null;
}

export function TopSellerLeaderboard({ sellers }: TopSellerLeaderboardProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(sellers.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentSellers = sellers.slice(startIndex, endIndex);

  // For page 1, we show the podium (top 3) and the rest (2 items)
  // For other pages, we just show the list
  const isPage1 = currentPage === 1;
  const top3 = isPage1 ? [sellers[1], sellers[0], sellers[2]] : [];
  const listSellers = isPage1 ? currentSellers.slice(3) : currentSellers;

  return (
    <div className="space-y-12">
      {/* Podium Top 3 - Only on page 1 */}
      {isPage1 && (
        <div className="grid grid-cols-3 gap-4 md:gap-8 items-end pt-8 px-4 md:px-12">
          {top3.map((user, index) => {
            if (!user) return <div key={index} className="bg-white/5 h-44 rounded-2xl border border-white/5 animate-pulse" />;
            
            const isTop1 = user.rank === 1;
            const positionMap = { 1: 1, 2: 2, 3: 3 } as any;
            const pos = positionMap[user.rank];
            const reward = getSellerReward(user.rank);

            return (
              <div key={user.id} className={`relative flex flex-col items-center ${isTop1 ? 'scale-110 z-10' : 'scale-100'}`}>
                <div className={`w-full p-4 md:p-6 rounded-t-3xl backdrop-blur-xl border-t border-x transition-all hover:-translate-y-2 ${
                  isTop1
                    ? 'bg-gradient-to-t from-[#FF7A00]/20 to-[#FFC857]/20 border-[#FFC857]/40 shadow-[0_-10px_40px_rgba(255,200,87,0.15)] h-[380px]'
                    : pos === 2
                    ? 'bg-gradient-to-t from-white/10 to-white/5 border-white/20 h-[340px]'
                    : 'bg-gradient-to-t from-[#FF7A00]/10 to-white/5 border-[#FF7A00]/20 h-[320px]'
                }`}>
                  <div className="flex flex-col items-center space-y-4 -mt-16">
                    {/* Avatar & Rank */}
                    <div className="relative">
                      {isTop1 && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl animate-bounce">
                          👑
                        </div>
                      )}
                      <div className={`rounded-full bg-neutral-900 border-4 flex items-center justify-center text-4xl shadow-2xl ${
                        isTop1 ? 'w-24 h-24 border-[#FFC857] shadow-[#FFC857]/30' : 'w-20 h-20 border-white/20'
                      }`}>
                        {user.avatar}
                      </div>
                      <span className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${
                        isTop1 ? 'bg-[#FFC857] text-neutral-900' : 
                        pos === 2 ? 'bg-zinc-300 text-neutral-900' : 'bg-amber-700 text-white'
                      }`}>
                        {pos}
                      </span>
                    </div>
                    
                    {/* Info */}
                    <div className="text-center pt-2">
                      <h3 className="font-bold text-white text-lg truncate max-w-[140px]">{user.username}</h3>
                      {user.badge && (
                        <span className={`text-[10px] uppercase tracking-wider font-bold block mt-1 px-2 py-0.5 rounded-full ${
                          isTop1 ? 'bg-[#FFC857]/20 text-[#FFC857]' : 'bg-white/10 text-white/70'
                        }`}>
                          {user.badge}
                        </span>
                      )}
                    </div>

                    {/* Top 5 Products Thumbnails */}
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      {user.topProducts?.slice(0, 5).map((imgUrl, idx) => (
                        <div key={idx} className={`rounded-md bg-white/10 overflow-hidden border border-white/10 ${isTop1 ? 'w-9 h-9' : 'w-7 h-7'}`}>
                          {imgUrl ? (
                            <img src={imgUrl} alt="Product" className="w-full h-full object-cover opacity-80" />
                          ) : (
                            <Package className="w-full h-full p-1.5 text-white/20" />
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-center border-t border-white/10 pt-3 w-full">
                      <div className={`${isTop1 ? 'text-2xl' : 'text-xl'} font-bold text-[#FF7A00]`}>{user.styleScore}</div>
                      <div className="text-[10px] text-white/50 uppercase tracking-widest mt-0.5">Tổng điểm</div>
                    </div>

                    {/* Reward Preview */}
                    {reward && (
                      <div className="flex flex-col items-center gap-1.5 w-full pt-2">
                        <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Quà (Có hạn)</div>
                        <div className="flex gap-2">
                          {reward.featured && (
                            <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded border border-white/5">
                              <span className="text-xs font-bold text-[#FFC857]">{reward.featured}</span>
                              <Flame className="w-3 h-3 text-[#FFC857]" />
                            </div>
                          )}
                          {reward.posting && (
                            <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded border border-white/5">
                              <span className="text-xs font-bold text-emerald-400">{reward.posting}</span>
                              <FileText className="w-3 h-3 text-emerald-400" />
                            </div>
                          )}
                        </div>
                        {reward.badge && (
                          <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded border border-white/5 mt-0.5">
                            <Award className="w-3 h-3 text-purple-400" />
                            <span className="text-[10px] font-bold text-purple-400 truncate max-w-[100px]">{reward.badge}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List items */}
      <div className="space-y-3 bg-white/5 p-6 rounded-3xl border border-white/10">
        <h3 className="text-lg font-bold text-white mb-4">{isPage1 ? "Top 4 - 5" : `Top ${startIndex + 1} - ${Math.min(endIndex, sellers.length)}`}</h3>
        {listSellers.map((user) => {
          const reward = getSellerReward(user.rank);
          
          return (
            <div
              key={user.id}
              className="p-4 rounded-xl bg-black/20 hover:bg-white/10 border border-white/5 transition-all group cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 flex-1">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-8 text-center font-bold text-xl text-white/40 group-hover:text-white transition-colors">
                    #{user.rank}
                  </div>
                  
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF7A00]/20 to-white/10 border border-white/10 flex items-center justify-center text-xl shadow-inner shrink-0">
                    {user.avatar}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-lg">{user.username}</span>
                      {user.badge && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFC857]/20 text-[#FFC857] hidden sm:block">
                          {user.badge}
                        </span>
                      )}
                    </div>
                    
                    {/* 5 Top Products Thumbnails */}
                    <div className="flex items-center gap-2 mt-2">
                      {user.topProducts?.slice(0, 5).map((imgUrl, idx) => (
                        <div key={idx} className="w-8 h-8 rounded-md bg-white/10 overflow-hidden border border-white/10">
                          {imgUrl ? (
                            <img src={imgUrl} alt="Product" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                          ) : (
                            <Package className="w-4 h-4 m-2 text-white/20" />
                          )}
                        </div>
                      ))}
                      {user.topProducts && user.topProducts.length === 0 && (
                        <div className="text-xs text-white/40 flex items-center gap-1">
                            <Package className="w-3 h-3" /> Chưa có sản phẩm nổi bật
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between md:justify-end gap-6 border-t border-white/5 pt-4 md:pt-0 md:border-0 w-full md:w-auto">
                {/* Reward Preview */}
                {reward && (
                  <div className="flex flex-col gap-1 items-start md:items-end w-full md:w-auto">
                    <div className="text-[10px] text-white/40 uppercase tracking-widest flex items-center gap-1"><Clock className="w-3 h-3"/> Quà</div>
                    <div className="flex flex-wrap gap-1 justify-start md:justify-end">
                      {reward.featured && (
                        <div className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                          <span className="text-xs font-bold text-[#FFC857]">{reward.featured}</span>
                          <Flame className="w-3 h-3 text-[#FFC857]" />
                        </div>
                      )}
                      {reward.posting && (
                        <div className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                          <span className="text-xs font-bold text-emerald-400">{reward.posting}</span>
                          <FileText className="w-3 h-3 text-emerald-400" />
                        </div>
                      )}
                      {reward.badge && (
                        <div className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                          <Award className="w-3 h-3 text-purple-400" />
                          <span className="text-[10px] font-bold text-purple-400 hidden lg:block max-w-[120px] truncate">{reward.badge}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-right shrink-0">
                  <div className="text-xl font-bold text-[#FF7A00]">{user.styleScore}</div>
                  <div className="text-xs text-white/40">Tổng điểm</div>
                </div>
                
                {user.trendChange !== 0 ? (
                  <div className={`flex items-center justify-end gap-1 w-8 shrink-0 ${user.trendChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    <TrendingUp className={`w-4 h-4 ${user.trendChange < 0 ? 'rotate-180' : ''}`} />
                  </div>
                ) : (
                  <div className="w-8 shrink-0 text-center text-white/20 font-bold">-</div>
                )}
              </div>
            </div>
          );
        })}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-6 mt-4 border-t border-white/10">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition-all text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                    currentPage === i + 1
                      ? 'bg-gradient-to-r from-[#FF7A00] to-[#FFC857] text-neutral-900 shadow-[0_0_15px_rgba(255,122,0,0.3)]'
                      : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition-all text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
