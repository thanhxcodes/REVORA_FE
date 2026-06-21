import { Heart, Eye, MessageCircle, Star, ChevronLeft, ChevronRight, Flame, FileText, Award, Clock } from 'lucide-react';
import { useState } from 'react';
import { RankingProduct } from './MockData';

interface TopProductLeaderboardProps {
  products: RankingProduct[];
}

const ITEMS_PER_PAGE = 5;

function getProductReward(rank: number) {
  if (rank === 1) return { featured: 15, posting: 15, badge: 'Product Of The Week' };
  if (rank === 2) return { featured: 12, posting: 12, badge: 'Top Product Weekly' };
  if (rank === 3) return { featured: 10, posting: 10, badge: 'Top Product Weekly' };
  if (rank === 4) return { featured: 8, posting: 8 };
  if (rank === 5) return { featured: 6, posting: 6 };
  if (rank === 6 || rank === 7) return { featured: 4, posting: 4 };
  if (rank >= 8 && rank <= 10) return { featured: 2, posting: 2 };
  if (rank >= 11 && rank <= 20) return { featured: 2, posting: 0 };
  return null;
}

export function TopProductLeaderboard({ products }: TopProductLeaderboardProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = products.slice(startIndex, endIndex);

  // For page 1, we show the podium (top 3) and the rest (2 items)
  const isPage1 = currentPage === 1;
  const top3 = isPage1 ? products.slice(0, 3) : [];
  const listProducts = isPage1 ? currentProducts.slice(3) : currentProducts;

  return (
    <div className="space-y-12">
      {/* Top 3 Featured Showcase - Only on page 1 */}
      {isPage1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {top3.map((product) => {
            if (!product) return <div key={Math.random()} className="bg-white/5 h-80 rounded-3xl animate-pulse" />;
            
            const isTop1 = product.rank === 1;
            const reward = getProductReward(product.rank);

            return (
              <div 
                key={product.id} 
                className={`group relative rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 flex flex-col ${
                  isTop1 ? 'md:col-span-1 ring-2 ring-[#FFC857] shadow-[0_0_30px_rgba(255,200,87,0.3)]' : 'border border-white/10 hover:border-white/30'
                }`}
              >
                {/* Image Background */}
                <div className="absolute inset-0 bg-neutral-900">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative flex flex-col justify-between p-6 flex-1 min-h-[400px]">
                  <div className="flex justify-between items-start">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold backdrop-blur-md shadow-lg ${
                      isTop1 ? 'bg-[#FFC857] text-neutral-900' : 'bg-white/20 text-white'
                    }`}>
                      #{product.rank}
                    </div>
                    {product.trending && (
                      <div className="px-3 py-1 bg-red-500/90 backdrop-blur text-white text-xs font-bold rounded-full uppercase tracking-wider animate-pulse">
                        Hot
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 mt-auto">
                    <div>
                      <h3 className="text-2xl font-bold text-white leading-tight mb-2">{product.name}</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                          {product.sellerAvatar}
                        </div>
                        <span className="text-white/70 text-sm font-medium">{product.seller}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-white/20 pt-4">
                      {/* Product Score Factors */}
                      <div className="grid grid-cols-4 gap-2">
                        <div className="text-center bg-black/40 rounded-lg py-1 border border-white/5">
                          <MessageCircle className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                          <div className="text-[10px] text-blue-400 font-bold mb-0.5">40%</div>
                          <span className="text-xs text-white/90 font-mono">{product.comments}</span>
                        </div>
                        <div className="text-center bg-black/40 rounded-lg py-1 border border-white/5">
                          <Heart className="w-4 h-4 text-pink-500 mx-auto mb-1" />
                          <div className="text-[10px] text-pink-500 font-bold mb-0.5">30%</div>
                          <span className="text-xs text-white/90 font-mono">{product.likes}</span>
                        </div>
                        <div className="text-center bg-black/40 rounded-lg py-1 border border-white/5">
                          <Star className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                          <div className="text-[10px] text-amber-400 font-bold mb-0.5">20%</div>
                          <span className="text-xs text-white/90 font-mono">{product.wishlist}</span>
                        </div>
                        <div className="text-center bg-black/40 rounded-lg py-1 border border-white/5">
                          <Eye className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                          <div className="text-[10px] text-emerald-400 font-bold mb-0.5">10%</div>
                          <span className="text-xs text-white/90 font-mono">{product.views}</span>
                        </div>
                      </div>
                      
                      <div className="text-right mt-1">
                        <div className="text-3xl font-bold text-[#FFC857] leading-none">{product.score}</div>
                        <div className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Điểm sản phẩm</div>
                      </div>

                      {/* Reward Preview */}
                      {reward && (
                        <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-1">
                          <div className="flex flex-col gap-1 w-full">
                            <div className="text-[10px] text-white/40 uppercase tracking-widest flex items-center gap-1"><Clock className="w-3 h-3"/> Quà (Có hạn)</div>
                            <div className="flex flex-wrap gap-1">
                              {reward.featured > 0 && (
                                <div className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                                  <span className="text-xs font-bold text-[#FFC857]">{reward.featured}</span>
                                  <Flame className="w-3 h-3 text-[#FFC857]" />
                                </div>
                              )}
                              {reward.posting > 0 && (
                                <div className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                                  <span className="text-xs font-bold text-emerald-400">{reward.posting}</span>
                                  <FileText className="w-3 h-3 text-emerald-400" />
                                </div>
                              )}
                              {reward.badge && (
                                <div className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                                  <Award className="w-3 h-3 text-purple-400" />
                                  <span className="text-[10px] font-bold text-purple-400">{reward.badge}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Grid items */}
      <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
        <h3 className="text-lg font-bold text-white mb-6">{isPage1 ? "Top 4 - 5" : `Top ${startIndex + 1} - ${Math.min(endIndex, products.length)}`}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {listProducts.map((product) => {
            const reward = getProductReward(product.rank);
            
            return (
              <div 
                key={product.id} 
                className="bg-black/40 rounded-2xl border border-white/5 overflow-hidden hover:border-white/20 transition-all group flex flex-col md:flex-row"
              >
                <div className="relative w-full md:w-40 h-40 shrink-0">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-2 left-2 w-8 h-8 rounded-lg bg-black/60 backdrop-blur flex items-center justify-center text-sm font-bold text-white">
                    #{product.rank}
                  </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-bold text-white text-sm line-clamp-1">{product.name}</h4>
                    <p className="text-xs text-white/50 mt-1">{product.seller}</p>
                  </div>
                  
                  {/* 4 Icons for list items */}
                  <div className="grid grid-cols-4 gap-1 mt-2">
                    <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                      <MessageCircle className="w-3 h-3 text-blue-400" />
                      <span className="text-[10px] text-white/70">{product.comments}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                      <Heart className="w-3 h-3 text-pink-500" />
                      <span className="text-[10px] text-white/70">{product.likes}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                      <Star className="w-3 h-3 text-amber-400" />
                      <span className="text-[10px] text-white/70">{product.wishlist}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                      <Eye className="w-3 h-3 text-emerald-400" />
                      <span className="text-[10px] text-white/70">{product.views}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 pt-2 mt-2">
                    {/* Reward Preview */}
                    <div className="flex items-center gap-1">
                      {reward && (
                        <>
                          {reward.featured > 0 && (
                            <div className="flex items-center gap-1 bg-black/40 px-1 py-0.5 rounded border border-white/5">
                              <span className="text-[10px] font-bold text-[#FFC857]">{reward.featured}</span>
                              <Flame className="w-2.5 h-2.5 text-[#FFC857]" />
                            </div>
                          )}
                          {reward.posting > 0 && (
                            <div className="flex items-center gap-1 bg-black/40 px-1 py-0.5 rounded border border-white/5">
                              <span className="text-[10px] font-bold text-emerald-400">{reward.posting}</span>
                              <FileText className="w-2.5 h-2.5 text-emerald-400" />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    
                    <div className="text-sm font-bold text-[#FF7A00]">{product.score} điểm</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-6 mt-6 border-t border-white/10">
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
