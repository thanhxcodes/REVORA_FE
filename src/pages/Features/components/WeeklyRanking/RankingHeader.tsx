import { Trophy, Clock, Gift } from 'lucide-react';
import { useState, useEffect } from 'react';

interface RankingHeaderProps {
  timeLeft: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  unclaimedCount: number;
  onOpenRewardChest: () => void;
}

export function RankingHeader({ timeLeft, unclaimedCount, onOpenRewardChest }: RankingHeaderProps) {
  const formatTimeStr = (num: number) => String(num).padStart(2, '0');

  // Animation state for the shine effect
  const [shine, setShine] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShine(true);
      setTimeout(() => setShine(false), 1500);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="sticky top-0 z-40 bg-gradient-to-r from-[#1a0a0f]/95 via-[#2a0f1a]/95 to-[#1a0a0f]/95 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-4">

        {/* Left: Title & Subtitle */}
        <div className="flex flex-col items-center lg:items-start shrink-0">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-[#C4603A] to-white bg-clip-text text-transparent flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#C4603A]" />
            BẢNG XẾP HẠNG TUẦN REVORA
          </h1>
          <p className="text-sm text-white/50 font-medium tracking-wider uppercase mt-1">
            Tranh tài • Dự đoán • Nhận Credit
          </p>
        </div>

        {/* Center: Countdown & Mini Wallet */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hidden md:block">
            <span className="text-sm font-bold text-[#FFC857]">Mùa #12</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
            <Clock className="w-4 h-4 text-[#C4603A]" />
            <span className="text-sm font-mono text-white/90">
              {timeLeft.days > 0 ? `${timeLeft.days} ngày ` : ''}
              {formatTimeStr(timeLeft.hours)}:{formatTimeStr(timeLeft.minutes)}:{formatTimeStr(timeLeft.seconds)}
            </span>
          </div>
        </div>

        {/* Right: Reward Chest */}
        <div className="flex items-center gap-3 shrink-0">

          {/* Reward Chest Icon */}
          <button
            onClick={onOpenRewardChest}
            className="relative group p-2.5 rounded-xl bg-gradient-to-b from-[#FF7A00]/20 to-[#E65C00]/10 border border-[#FF7A00]/30 hover:border-[#FF7A00] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,122,0,0.4)] overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] skew-x-[-20deg] ${shine ? 'animate-[shimmer_1.5s_ease-in-out]' : ''}`} />

            <Gift className="w-5 h-5 text-[#FFC857] group-hover:text-white transition-colors drop-shadow-[0_0_8px_rgba(255,200,87,0.8)]" />

            {unclaimedCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[20px] h-5 px-1 bg-red-500 border border-[#2a0f1a] text-white text-[10px] font-bold rounded-full shadow-lg">
                {unclaimedCount}
              </span>
            )}
          </button>

        </div>
      </div>
    </div>
  );
}
