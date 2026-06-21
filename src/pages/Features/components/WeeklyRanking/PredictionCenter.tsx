import { useState } from 'react';
import { Target, Flame, TrendingUp, Minus, Plus, Lock, Sparkles, AlertCircle } from 'lucide-react';
import { RankingUser, RankingProduct, MOCK_SELLERS, MOCK_PRODUCTS } from './MockData';

const PREDICTION_MAX_CREDITS = { 1: 10, 2: 8, 3: 6, 4: 4, 5: 2 };

interface PredictionCenterProps {
  isPredictionLocked: boolean;
  timeLeft: { days: number; hours: number; minutes: number; seconds: number };
  userBalances: { posting: number; featured: number };
  onPredict: (prediction: any) => void;
}

export function PredictionCenter({ isPredictionLocked, timeLeft, userBalances, onPredict }: PredictionCenterProps) {
  const [selectedType, setSelectedType] = useState<'seller' | 'product'>('seller');
  const [selectedPosition, setSelectedPosition] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<any | null>(null);
  
  const [inputLimited, setInputLimited] = useState<number>(0);
  const [inputPermanent, setInputPermanent] = useState<number>(0);

  const maxAllowedCredit = selectedPosition ? PREDICTION_MAX_CREDITS[selectedPosition] : 0;
  const currentTotalBet = inputLimited + inputPermanent;

  const currentAvailableLimited = selectedType === 'product' ? userBalances.posting : userBalances.featured;
  const currentAvailablePermanent = 0; // Simplified for UI since we merged posting/featured

  const handleStepChange = (mode: 'limited' | 'permanent', action: 'inc' | 'dec') => {
    const step = 2;
    if (mode === 'limited') {
      if (action === 'inc') {
        if (currentTotalBet + step <= maxAllowedCredit && inputLimited + step <= currentAvailableLimited) {
          setInputLimited(prev => prev + step);
        }
      } else {
        setInputLimited(prev => Math.max(0, prev - step));
      }
    } else {
      if (action === 'inc') {
        if (currentTotalBet + step <= maxAllowedCredit && inputPermanent + step <= currentAvailablePermanent) {
          setInputPermanent(prev => prev + step);
        }
      } else {
        setInputPermanent(prev => Math.max(0, prev - step));
      }
    }
  };

  const handleSubmit = () => {
    if (!selectedTarget || !selectedPosition) return;
    onPredict({
      type: selectedType,
      position: selectedPosition,
      targetId: selectedTarget.id,
      targetName: selectedType === 'seller' ? selectedTarget.username : selectedTarget.name,
      limitedCreditsUsed: inputLimited,
      permanentCreditsUsed: inputPermanent,
    });
    
    // Reset form after submission
    setSelectedPosition(null);
    setSelectedTarget(null);
    setInputLimited(0);
    setInputPermanent(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* LEFT SIDE: Form */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Step 1 */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#FF7A00] text-black flex items-center justify-center text-sm">1</span>
            Chọn Hạng Mục
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => { setSelectedType('seller'); setSelectedTarget(null); setInputLimited(0); setInputPermanent(0); }}
              className={`p-4 rounded-2xl border text-left transition-all ${selectedType === 'seller' ? 'bg-[#FF7A00]/20 border-[#FF7A00]' : 'bg-black/20 border-white/5 hover:border-white/20'}`}
            >
              <Flame className={`w-6 h-6 mb-2 ${selectedType === 'seller' ? 'text-[#FF7A00]' : 'text-white/40'}`} />
              <div className="font-bold text-white">Top Cửa Hàng</div>
              <div className="text-xs text-white/50 mt-1">Sử dụng Featured Credit</div>
            </button>
            <button
              onClick={() => { setSelectedType('product'); setSelectedTarget(null); setInputLimited(0); setInputPermanent(0); }}
              className={`p-4 rounded-2xl border text-left transition-all ${selectedType === 'product' ? 'bg-[#FFC857]/20 border-[#FFC857]' : 'bg-black/20 border-white/5 hover:border-white/20'}`}
            >
              <TrendingUp className={`w-6 h-6 mb-2 ${selectedType === 'product' ? 'text-[#FFC857]' : 'text-white/40'}`} />
              <div className="font-bold text-white">Top Sản Phẩm</div>
              <div className="text-xs text-white/50 mt-1">Sử dụng Posting Credit</div>
            </button>
          </div>
        </div>

        {/* Step 2 */}
        <div className={`bg-white/5 border border-white/10 rounded-3xl p-6 transition-all ${!selectedType ? 'opacity-50 pointer-events-none' : ''}`}>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#FF7A00] text-black flex items-center justify-center text-sm">2</span>
            Chọn Vị Trí Dự Đoán
          </h3>
          <div className="grid grid-cols-5 gap-3">
            {([1, 2, 3, 4, 5] as const).map((pos) => (
              <button
                key={pos}
                onClick={() => { setSelectedPosition(pos); setInputLimited(0); setInputPermanent(0); }}
                className={`p-3 rounded-xl border text-center transition-all ${selectedPosition === pos ? 'bg-white/20 border-white shadow-lg' : 'bg-black/20 border-white/5 hover:border-white/20'}`}
              >
                <div className={`text-xl font-bold ${selectedPosition === pos ? 'text-[#FFC857]' : 'text-white/60'}`}>#{pos}</div>
                <div className="text-[10px] text-white/40 mt-1">Tối đa {PREDICTION_MAX_CREDITS[pos]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3 */}
        <div className={`bg-white/5 border border-white/10 rounded-3xl p-6 transition-all ${!selectedPosition ? 'opacity-50 pointer-events-none' : ''}`}>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#FF7A00] text-black flex items-center justify-center text-sm">3</span>
            Chọn Đối Tượng
          </h3>
          <div className="bg-black/30 rounded-2xl p-2 max-h-60 overflow-y-auto border border-white/5">
            {selectedType === 'seller' ? (
              MOCK_SELLERS.map((seller) => (
                <button
                  key={seller.id}
                  onClick={() => setSelectedTarget(seller)}
                  className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${selectedTarget?.id === seller.id ? 'bg-[#FF7A00]/30' : 'hover:bg-white/10'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">{seller.avatar}</div>
                  <div className="text-left flex-1">
                    <div className="font-bold text-white">{seller.username}</div>
                    <div className="text-xs text-white/50">Hạng hiện tại #{seller.rank}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#FF7A00]">{seller.styleScore}</div>
                    <div className="text-[10px] text-white/50">Điểm số</div>
                  </div>
                </button>
              ))
            ) : (
              MOCK_PRODUCTS.map((prod) => (
                <button
                  key={prod.id}
                  onClick={() => setSelectedTarget(prod)}
                  className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${selectedTarget?.id === prod.id ? 'bg-[#FFC857]/30' : 'hover:bg-white/10'}`}
                >
                  <img src={prod.image} className="w-12 h-12 rounded-lg object-cover" alt="" />
                  <div className="text-left flex-1">
                    <div className="font-bold text-white truncate max-w-[200px]">{prod.name}</div>
                    <div className="text-xs text-white/50">Bởi {prod.seller} • Hạng #{prod.rank}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#FFC857]">{prod.score}</div>
                    <div className="text-[10px] text-white/50">Điểm số</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

      </div>

      {/* RIGHT SIDE: Summary & Betting */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Prediction Lock Card */}
        <div className={`p-6 rounded-3xl border transition-all ${
          timeLeft.days === 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/10'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <Lock className={`w-5 h-5 ${timeLeft.days === 0 ? 'text-red-400' : 'text-white/60'}`} />
            <h3 className="font-bold text-white">Đóng dự đoán trong</h3>
          </div>
          <div className={`text-3xl font-mono font-bold ${timeLeft.days === 0 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            {formatTimeStr(timeLeft.hours)}:{formatTimeStr(timeLeft.minutes)}:{formatTimeStr(timeLeft.seconds)}
          </div>
          {isPredictionLocked && (
            <div className="mt-3 text-sm text-red-400 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Hiện tại không thể dự đoán nữa.
            </div>
          )}
        </div>

        {/* Live Summary Card */}
        <div className="bg-gradient-to-br from-[#1E1E1E] to-[#121212] rounded-3xl border border-white/10 p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Target className="w-24 h-24" /></div>
          <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-4">Phiếu Dự Đoán</h3>
          
          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-end border-b border-white/10 pb-4">
              <div>
                <div className="text-xs text-white/50 mb-1">Mục tiêu</div>
                <div className="font-bold text-lg text-white">
                  {selectedTarget ? (selectedType === 'seller' ? selectedTarget.username : selectedTarget.name) : '---'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-white/50 mb-1">Vị trí</div>
                <div className="font-bold text-2xl text-[#FFC857]">
                  {selectedPosition ? `#${selectedPosition}` : '--'}
                </div>
              </div>
            </div>

            {selectedTarget && selectedPosition && (
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest">Sử dụng Credit</h4>
                
                {/* Limited Credit */}
                <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5">
                  <div>
                    <div className="text-sm font-bold text-white">Credit Giới hạn</div>
                    <div className="text-[10px] text-white/40">Có sẵn: {currentAvailableLimited}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleStepChange('limited', 'dec')} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                    <span className="w-6 text-center font-mono font-bold">{inputLimited}</span>
                    <button onClick={() => handleStepChange('limited', 'inc')} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-2">
                  <div className="text-sm text-white/50">Tổng cược</div>
                  <div className="text-xl font-bold font-mono text-[#FF7A00]">{currentTotalBet} / {maxAllowedCredit}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reward Preview */}
        {selectedTarget && currentTotalBet > 0 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4">
              <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-2">Nếu Thắng</div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span className="text-2xl font-bold text-emerald-400">+{currentTotalBet * 2}</span>
              </div>
              <div className="text-[10px] text-emerald-400/60 mt-1">Hoàn 100% + Thưởng 100%</div>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-4">
              <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-2">Nếu Thua</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-zinc-300">+{Math.floor(currentTotalBet / 2)}</span>
              </div>
              <div className="text-[10px] text-zinc-500 mt-1">Hoàn 50%</div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isPredictionLocked || !selectedTarget || currentTotalBet === 0 || currentTotalBet % 2 !== 0}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF7A00] to-[#FFC857] text-neutral-900 font-bold text-lg hover:shadow-[0_0_30px_rgba(255,122,0,0.3)] transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          Xác Nhận Dự Đoán
        </button>

      </div>
    </div>
  );
}

function formatTimeStr(num: number) {
  return String(num).padStart(2, '0');
}
