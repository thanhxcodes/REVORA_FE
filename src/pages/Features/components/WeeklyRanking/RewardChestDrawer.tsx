import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../../../../components/ui/sheet';
import { Gift, CheckCircle2, PackageOpen, Award, Medal, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export type RewardType = 'leaderboard' | 'prediction' | 'event' | 'compensation';

export interface RewardItem {
  id: string;
  type: RewardType;
  title: string;
  subtitle: string;
  postingCredit: number;
  featuredCredit: number;
  date: string;
}

interface RewardChestDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unclaimedRewards: RewardItem[];
  rewardHistory: RewardItem[];
  onClaimReward: (rewardId: string) => void;
  onClaimAll: () => void;
  onGoToPrediction: () => void;
}

export function RewardChestDrawer({
  open,
  onOpenChange,
  unclaimedRewards,
  rewardHistory,
  onClaimReward,
  onClaimAll,
  onGoToPrediction
}: RewardChestDrawerProps) {
  const [filter, setFilter] = useState<'all' | 'leaderboard' | 'prediction' | 'event'>('all');

  const filteredHistory = rewardHistory.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const fireConfetti = () => {
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFC857', '#FF7A00', '#ffffff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FFC857', '#FF7A00', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const handleClaim = (id: string) => {
    fireConfetti();
    onClaimReward(id);
  };

  const handleClaimAll = () => {
    fireConfetti();
    onClaimAll();
  };

  const getRewardIcon = (type: RewardType) => {
    switch (type) {
      case 'leaderboard': return <TrophyIcon className="w-5 h-5 text-[#FFC857]" />;
      case 'prediction': return <TargetIcon className="w-5 h-5 text-emerald-400" />;
      case 'event': return <Award className="w-5 h-5 text-purple-400" />;
      default: return <Gift className="w-5 h-5 text-[#FF7A00]" />;
    }
  };

  const getRewardBadgeColor = (type: RewardType) => {
    switch (type) {
      case 'leaderboard': return 'bg-[#FFC857]/10 text-[#FFC857] border-[#FFC857]/20';
      case 'prediction': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'event': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-[#FF7A00]/10 text-[#FF7A00] border-[#FF7A00]/20';
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] bg-[#0F0F0F] border-l border-[#FF7A00]/20 p-0 flex flex-col h-full overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#FF7A00]/10 to-transparent pointer-events-none" />
        
        <SheetHeader className="p-6 border-b border-white/5 relative z-10">
          <SheetTitle className="flex items-center gap-3 text-2xl font-bold text-white">
            <div className="p-2 bg-[#FF7A00]/10 rounded-xl border border-[#FF7A00]/20">
              <Gift className="w-6 h-6 text-[#FF7A00]" />
            </div>
            Reward Chest
          </SheetTitle>
          <SheetDescription className="text-white/50 text-base">
            Nhận phần thưởng hàng tuần của bạn
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-10 custom-scrollbar">
          
          {/* Section 1: Available Rewards */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Phần thưởng có sẵn
                {unclaimedRewards.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#FF7A00] text-white text-xs">
                    {unclaimedRewards.length}
                  </span>
                )}
              </h3>
              {unclaimedRewards.length > 1 && (
                <button 
                  onClick={handleClaimAll}
                  className="text-sm font-semibold text-[#FFC857] hover:text-white transition-colors"
                >
                  Nhận tất cả
                </button>
              )}
            </div>

            {unclaimedRewards.length > 0 ? (
              <div className="space-y-4">
                {unclaimedRewards.map((reward) => (
                  <div 
                    key={reward.id} 
                    className="relative group bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-[#FF7A00]/40 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[200%] group-hover:animate-[shimmer_2s_infinite]" />
                    
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl border ${getRewardBadgeColor(reward.type)} bg-opacity-20`}>
                          {getRewardIcon(reward.type)}
                        </div>
                        <div>
                          <div className={`text-xs font-bold border px-2 py-0.5 rounded-md inline-block mb-1 ${getRewardBadgeColor(reward.type)}`}>
                            {reward.type === 'leaderboard' ? 'Bảng xếp hạng' : reward.type === 'prediction' ? 'Dự đoán' : 'Sự kiện'}
                          </div>
                          <h4 className="font-bold text-white text-base">{reward.title}</h4>
                          <p className="text-sm text-white/50">{reward.subtitle}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 relative z-10">
                      <div className="flex items-center gap-3">
                        {reward.featuredCredit > 0 && (
                          <div className="flex items-center gap-1.5 bg-[#FFC857]/10 px-2.5 py-1 rounded-lg border border-[#FFC857]/20">
                            <span className="text-[#FFC857] font-bold">+{reward.featuredCredit}</span>
                            <span className="text-xs text-[#FFC857]/70">Featured</span>
                          </div>
                        )}
                        {reward.postingCredit > 0 && (
                          <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                            <span className="text-emerald-400 font-bold">+{reward.postingCredit}</span>
                            <span className="text-xs text-emerald-400/70">Posting</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleClaim(reward.id)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#E65C00] text-white text-sm font-bold shadow-[0_0_15px_rgba(255,122,0,0.3)] hover:shadow-[0_0_25px_rgba(255,122,0,0.5)] hover:scale-105 transition-all"
                      >
                        Nhận thưởng
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 bg-white/5 border border-white/10 rounded-2xl border-dashed">
                <PackageOpen className="w-16 h-16 text-white/20 mb-4" />
                <p className="text-white font-medium text-lg mb-1">Chưa có phần thưởng nào</p>
                <p className="text-white/50 text-sm text-center max-w-[250px] mb-6">
                  Tham gia đua top hoặc dự đoán chính xác để kiếm thêm nhiều phần thưởng hấp dẫn!
                </p>
                <button 
                  onClick={() => {
                    onOpenChange(false);
                    onGoToPrediction();
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-medium transition-colors"
                >
                  Đến Trung tâm dự đoán <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </section>

          {/* Section 2: Reward History */}
          <section>
            <h3 className="text-lg font-bold text-white mb-4">Lịch sử nhận thưởng</h3>
            
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
              {['all', 'leaderboard', 'prediction', 'event'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    filter === f 
                      ? 'bg-white/20 text-white' 
                      : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {f === 'all' ? 'Tất cả' : f === 'leaderboard' ? 'Bảng xếp hạng' : f === 'prediction' ? 'Dự đoán' : 'Sự kiện'}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((reward) => (
                  <div key={reward.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/5 text-white/40">
                        {getRewardIcon(reward.type)}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{reward.title}</p>
                        <p className="text-xs text-white/40">{reward.date}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="flex gap-2 mb-1">
                        {reward.featuredCredit > 0 && <span className="text-xs font-medium text-[#FFC857]">+{reward.featuredCredit} F</span>}
                        {reward.postingCredit > 0 && <span className="text-xs font-medium text-emerald-400">+{reward.postingCredit} P</span>}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-white/30 uppercase tracking-widest font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500/50" /> Đã nhận
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-white/40 text-sm">
                  Không có lịch sử nào
                </div>
              )}
            </div>
          </section>

        </div>
      </SheetContent>
    </Sheet>
  );
}

// Helper components for icons to keep it simple
function TrophyIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  );
}

function TargetIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  );
}
