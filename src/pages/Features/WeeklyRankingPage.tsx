import { useState, useEffect } from 'react';
import { Flame, TrendingUp, Target, Info, Clock, Sparkles, Lock, Gift, MessageCircle, Heart, Star, Eye } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

// Components
import { RankingHeader } from './components/WeeklyRanking/RankingHeader';
import { TopSellerLeaderboard } from './components/WeeklyRanking/TopSellerLeaderboard';
import { TopProductLeaderboard } from './components/WeeklyRanking/TopProductLeaderboard';
import { PredictionCenter } from './components/WeeklyRanking/PredictionCenter';
import { RewardChestDrawer, RewardItem } from './components/WeeklyRanking/RewardChestDrawer';

// Mock Data
import { MOCK_SELLERS, MOCK_PRODUCTS } from './components/WeeklyRanking/MockData';

export default function WeeklyRankingPage() {
  const [activeTab, setActiveTab] = useState<'seller' | 'product' | 'prediction'>('seller');
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showRewardChest, setShowRewardChest] = useState(false);
  const [showDemoPopup, setShowDemoPopup] = useState(true);

  // MOCK: User Balances
  const [userBalances, setUserBalances] = useState({
    posting: 34,
    featured: 20,
  });

  // MOCK: Rewards
  const [unclaimedRewards, setUnclaimedRewards] = useState<RewardItem[]>([
    {
      id: 'r1',
      type: 'leaderboard',
      title: 'Top Cửa Hàng #2',
      subtitle: 'Phần thưởng Xếp hạng Tuần 11',
      postingCredit: 12,
      featuredCredit: 24,
      date: 'Hôm nay'
    },
    {
      id: 'r2',
      type: 'prediction',
      title: 'Dự đoán chính xác',
      subtitle: 'Top Sản Phẩm #1 Tuần 11',
      postingCredit: 10,
      featuredCredit: 0,
      date: 'Hôm nay'
    },
    {
      id: 'r3',
      type: 'event',
      title: 'Tham gia Sự kiện',
      subtitle: 'Sự kiện Mùa Hè 2026',
      postingCredit: 5,
      featuredCredit: 5,
      date: 'Hôm qua'
    }
  ]);

  const [rewardHistory, setRewardHistory] = useState<RewardItem[]>([
    {
      id: 'h1',
      type: 'leaderboard',
      title: 'Top Cửa Hàng #3',
      subtitle: 'Tuần 10',
      postingCredit: 10,
      featuredCredit: 18,
      date: 'Tuần trước'
    }
  ]);

  // Countdown Timer State
  const [timeLeft, setTimeLeft] = useState({ days: 6, hours: 12, minutes: 23, seconds: 10 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        clearInterval(timer);
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isPredictionLocked = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  const handlePrediction = (prediction: any) => {
    // Deduct credits locally for demo
    if (prediction.type === 'product') {
      setUserBalances(prev => ({
        ...prev,
        posting: prev.posting - (prediction.limitedCreditsUsed + prediction.permanentCreditsUsed)
      }));
    } else {
      setUserBalances(prev => ({
        ...prev,
        featured: prev.featured - (prediction.limitedCreditsUsed + prediction.permanentCreditsUsed)
      }));
    }

    setShowRewardModal(true);
  };

  const handleClaimReward = (id: string) => {
    const reward = unclaimedRewards.find(r => r.id === id);
    if (reward) {
      // Add to balance
      setUserBalances(prev => ({
        posting: prev.posting + reward.postingCredit,
        featured: prev.featured + reward.featuredCredit
      }));
      // Move to history
      setRewardHistory(prev => [{ ...reward, date: 'Vừa xong' }, ...prev]);
      setUnclaimedRewards(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleClaimAll = () => {
    let totalPosting = 0;
    let totalFeatured = 0;

    unclaimedRewards.forEach(r => {
      totalPosting += r.postingCredit;
      totalFeatured += r.featuredCredit;
    });

    setUserBalances(prev => ({
      posting: prev.posting + totalPosting,
      featured: prev.featured + totalFeatured
    }));

    const claimed = unclaimedRewards.map(r => ({ ...r, date: 'Vừa xong' }));
    setRewardHistory(prev => [...claimed, ...prev]);
    setUnclaimedRewards([]);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#0F0F0F] text-white selection:bg-[#FF7A00]/30 font-sans">

        {/* Header Component */}
        <RankingHeader
          timeLeft={timeLeft}
          unclaimedCount={unclaimedRewards.length}
          onOpenRewardChest={() => setShowRewardChest(true)}
        />

        <RewardChestDrawer
          open={showRewardChest}
          onOpenChange={setShowRewardChest}
          unclaimedRewards={unclaimedRewards}
          rewardHistory={rewardHistory}
          onClaimReward={handleClaimReward}
          onClaimAll={handleClaimAll}
          onGoToPrediction={() => {
            setActiveTab('prediction');
          }}
        />

        <div className="max-w-7xl mx-auto px-6 py-8">

          {/* Quick Info & Rules */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowRulesModal(true)}
                className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
              >
                <Info className="w-4 h-4" /> Thể lệ & Hướng dẫn
              </button>
            </div>
            {/* Đã chuyển Mini Wallet lên Header */}
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-4 mb-12 p-2 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-xl">
            <button
              onClick={() => setActiveTab('seller')}
              className={`flex-1 py-4 rounded-3xl font-bold transition-all duration-300 flex items-center justify-center gap-3 ${activeTab === 'seller'
                ? 'bg-gradient-to-r from-[#FF7A00] to-[#FFC857] text-neutral-900 shadow-[0_0_20px_rgba(255,122,0,0.3)]'
                : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
            >
              <Flame className="w-5 h-5" /> Top Cửa Hàng
            </button>
            <button
              onClick={() => setActiveTab('product')}
              className={`flex-1 py-4 rounded-3xl font-bold transition-all duration-300 flex items-center justify-center gap-3 ${activeTab === 'product'
                ? 'bg-gradient-to-r from-[#FF7A00] to-[#FFC857] text-neutral-900 shadow-[0_0_20px_rgba(255,122,0,0.3)]'
                : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
            >
              <TrendingUp className="w-5 h-5" /> Top Sản Phẩm
            </button>
            <button
              onClick={() => setActiveTab('prediction')}
              className={`flex-1 py-4 rounded-3xl font-bold transition-all duration-300 flex items-center justify-center gap-3 ${activeTab === 'prediction'
                ? 'bg-gradient-to-r from-[#FF7A00] to-[#FFC857] text-neutral-900 shadow-[0_0_20px_rgba(255,122,0,0.3)]'
                : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
            >
              <Target className="w-5 h-5" /> Trung Tâm Dự Đoán
            </button>
          </div>

          {/* Tab Content */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'seller' && <TopSellerLeaderboard sellers={MOCK_SELLERS} />}
            {activeTab === 'product' && <TopProductLeaderboard products={MOCK_PRODUCTS} />}
            {activeTab === 'prediction' && (
              <PredictionCenter
                onPredict={handlePrediction}
                isPredictionLocked={isPredictionLocked}
                timeLeft={timeLeft}
                userBalances={userBalances}
              />
            )}
          </div>
        </div>

        {/* Rules Modal */}
        <Dialog open={showRulesModal} onOpenChange={setShowRulesModal}>
          <DialogContent className="bg-[#1a0a0f] border-white/10 text-white sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Info className="w-5 h-5 text-[#FF7A00]" />
                Quy định BXH & Thưởng
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-8 mt-4 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar text-sm text-white/80">

              <p className="text-white">Tham gia bảng xếp hạng hàng tuần, dự đoán người chiến thắng và nhận Credit thưởng hấp dẫn!</p>

              {/* Bảng Xếp Hạng Hàng Tuần */}
              <section>
                <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">📈 Bảng Xếp Hạng Hàng Tuần</h3>
                <p className="mb-4">REVORA hiện có 2 bảng xếp hạng:</p>

                <div className="space-y-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <h4 className="font-bold text-[#FFC857] flex items-center gap-2 mb-2 text-base">
                      <Flame className="w-5 h-5" /> Top Seller Weekly
                    </h4>
                    <p className="mb-2">Xếp hạng những Seller có sản phẩm nổi bật được cộng đồng quan tâm nhất trong tuần.</p>
                    <p className="text-white/60 text-xs bg-black/20 p-2 rounded">
                      Điểm Seller được tính từ <strong>tối đa 5 sản phẩm nổi bật có điểm cao nhất</strong> của họ.
                      Điều này giúp tạo sân chơi công bằng hơn giữa Seller mới và Seller lâu năm.
                    </p>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <h4 className="font-bold text-[#FF7A00] flex items-center gap-2 mb-2 text-base">
                      <TrendingUp className="w-5 h-5" /> Top Product Weekly
                    </h4>
                    <p className="mb-2">Xếp hạng những sản phẩm nổi bật được yêu thích nhất trong tuần.</p>
                    <p className="text-white/60 text-xs bg-black/20 p-2 rounded">
                      Chỉ các sản phẩm <strong>đang sử dụng Featured Credit</strong> mới đủ điều kiện tham gia bảng xếp hạng.
                    </p>
                  </div>
                </div>
              </section>

              {/* Điểm Sản Phẩm Được Tính Như Thế Nào? */}
              <section>
                <h3 className="text-lg font-bold text-white mb-3">⭐ Điểm Sản Phẩm Được Tính Như Thế Nào?</h3>
                <p className="mb-2">Điểm sản phẩm được tổng hợp từ:</p>
                <ul className="grid grid-cols-2 gap-2 text-sm">
                  <li className="bg-white/5 px-3 py-2 rounded-lg flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-blue-400" /> Bình luận (40%)
                  </li>
                  <li className="bg-white/5 px-3 py-2 rounded-lg flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-500" /> Lượt thích (30%)
                  </li>
                  <li className="bg-white/5 px-3 py-2 rounded-lg flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" /> Wishlist (20%)
                  </li>
                  <li className="bg-white/5 px-3 py-2 rounded-lg flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-400" /> Lượt xem (10%)
                  </li>
                </ul>
                <p className="mt-2 text-xs text-white/50 italic">Mỗi hành động đều đóng góp vào điểm xếp hạng của sản phẩm.</p>
              </section>

              {/* Dự Đoán Bảng Xếp Hạng */}
              <section>
                <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">🎯 Dự Đoán Bảng Xếp Hạng</h3>
                <p className="mb-2">Bạn có thể sử dụng Credit để dự đoán:</p>
                <div className="flex gap-4">
                  <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                    <ul className="list-disc pl-5 text-emerald-400 font-bold space-y-1">
                      <li>Top 1</li><li>Top 2</li><li>Top 3</li><li>Top 4</li><li>Top 5</li>
                    </ul>
                  </div>
                  <div className="flex items-center text-white/50">của</div>
                  <div className="flex-1 bg-[#FF7A00]/10 border border-[#FF7A00]/20 p-3 rounded-xl flex flex-col justify-center">
                    <ul className="list-disc pl-5 text-[#FF7A00] font-bold space-y-1">
                      <li>Top Seller Weekly</li>
                      <li>Top Product Weekly</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Credit Dùng Để Dự Đoán */}
              <section>
                <h3 className="text-lg font-bold text-white mb-3">💳 Credit Dùng Để Dự Đoán</h3>
                <p className="mb-3">REVORA có 2 loại Credit:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl">
                    <h4 className="font-bold text-white mb-2 flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-400" /> ⏳ Credit Có Hạn</h4>
                    <p className="text-xs text-white/60 mb-2">Nguồn nhận: Sự kiện, BXH tuần, Quà tặng, Thưởng dự đoán.</p>
                    <span className="text-xs font-bold text-emerald-400">Có thời hạn sử dụng.</span>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl">
                    <h4 className="font-bold text-white mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#FFC857]" /> ♾️ Credit Vĩnh Viễn</h4>
                    <p className="text-xs text-white/60 mb-2">Nguồn nhận: Các gói Credit trả phí.</p>
                    <span className="text-xs font-bold text-[#FFC857]">Không có ngày hết hạn.</span>
                  </div>
                </div>
              </section>

              {/* Quy Tắc Đặt Cược & Giới Hạn */}
              <section>
                <h3 className="text-lg font-bold text-white mb-3">🔥 Quy Tắc & Giới Hạn Dự Đoán</h3>
                <div className="bg-white/5 p-4 rounded-xl mb-4">
                  <p className="mb-2">Mỗi lần tăng hoặc giảm sẽ thay đổi: <strong>2 Credit</strong></p>
                  <p className="text-xs text-white/50 font-mono bg-black/30 p-2 rounded inline-block">Ví dụ: 0 → 2 → 4 → 6 → 8 → 10 (Không thể đặt số lẻ 1, 3, 5...)</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-white/10 rounded-xl overflow-hidden">
                    <div className="bg-white/5 p-2 text-center font-bold text-sm">Dự Đoán BXH Seller</div>
                    <div className="p-3 text-xs space-y-1">
                      <div className="flex justify-between"><span>Top 1:</span> <span className="font-bold text-[#FFC857]">10 Featured Credit</span></div>
                      <div className="flex justify-between"><span>Top 2:</span> <span className="font-bold text-[#FFC857]">8 Featured Credit</span></div>
                      <div className="flex justify-between"><span>Top 3:</span> <span className="font-bold text-[#FFC857]">6 Featured Credit</span></div>
                      <div className="flex justify-between"><span>Top 4:</span> <span className="font-bold text-[#FFC857]">4 Featured Credit</span></div>
                      <div className="flex justify-between"><span>Top 5:</span> <span className="font-bold text-[#FFC857]">2 Featured Credit</span></div>
                    </div>
                  </div>
                  <div className="border border-white/10 rounded-xl overflow-hidden">
                    <div className="bg-white/5 p-2 text-center font-bold text-sm">Dự Đoán BXH Product</div>
                    <div className="p-3 text-xs space-y-1">
                      <div className="flex justify-between"><span>Top 1:</span> <span className="font-bold text-emerald-400">10 Posting Credit</span></div>
                      <div className="flex justify-between"><span>Top 2:</span> <span className="font-bold text-emerald-400">8 Posting Credit</span></div>
                      <div className="flex justify-between"><span>Top 3:</span> <span className="font-bold text-emerald-400">6 Posting Credit</span></div>
                      <div className="flex justify-between"><span>Top 4:</span> <span className="font-bold text-emerald-400">4 Posting Credit</span></div>
                      <div className="flex justify-between"><span>Top 5:</span> <span className="font-bold text-emerald-400">2 Posting Credit</span></div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Thời Gian Khóa Dự Đoán */}
              <section className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                <h3 className="text-lg font-bold text-red-400 mb-2 flex items-center gap-2"><Lock className="w-5 h-5" /> ⏰ Thời Gian Khóa Dự Đoán</h3>
                <p>Dự đoán sẽ đóng vào: <strong className="text-white">18:00 Chủ Nhật hàng tuần</strong></p>
                <p className="text-xs mt-1 text-white/60">Sau thời điểm này: Không thể tạo mới, chỉnh sửa hay hủy dự đoán.</p>
                <p className="mt-3">Kết quả được chốt khi BXH kết thúc vào: <strong className="text-white">23:59 Chủ Nhật</strong></p>
              </section>

              {/* Thưởng và Phạt */}
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                  <h4 className="font-bold text-emerald-400 mb-2">🎉 Nếu Dự Đoán Đúng</h4>
                  <ul className="text-sm space-y-1 mb-2">
                    <li>✅ 100% Credit đã sử dụng</li>
                    <li>➕</li>
                    <li>🎁 100% Credit thưởng</li>
                  </ul>
                  <div className="text-xs bg-black/20 p-2 rounded">VD: Đặt 10 → Nhận 20</div>
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                  <h4 className="font-bold text-zinc-300 mb-2">😢 Nếu Dự Đoán Sai</h4>
                  <ul className="text-sm space-y-1 mb-2">
                    <li>Bạn vẫn được hoàn lại:</li>
                    <li>✅ 50% Credit đã sử dụng</li>
                  </ul>
                  <div className="text-xs bg-black/20 p-2 rounded">VD: Đặt 10 → Nhận lại 5</div>
                </div>
              </section>

              {/* Nhận thưởng */}
              <section>
                <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">🎁 Phần Thưởng & Cách Nhận</h3>
                <p className="mb-2">Mỗi tuần, REVORA sẽ trao thưởng cho: <strong>🏆 Top 20 Seller</strong> và <strong>🏆 Top 20 Product</strong>.</p>
                <div className="bg-[#FF7A00]/10 border border-[#FF7A00]/30 p-4 rounded-xl mt-4">
                  <h4 className="font-bold text-[#FFC857] mb-2 flex items-center gap-2"><Gift className="w-5 h-5" /> Nhận Thưởng Ở Đâu?</h4>
                  <p className="text-sm text-white/80">Mọi phần thưởng sẽ được gửi vào <strong>Reward Chest</strong> ở góc trên bên phải màn hình. Bạn cần mở Reward Chest và nhận thưởng thủ công.</p>
                </div>
              </section>

              {/* Lưu ý */}
              <section className="bg-white/5 p-4 rounded-xl text-xs text-white/50 space-y-2">
                <h4 className="font-bold text-white/80 mb-2">⚠️ Lưu Ý</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Credit thưởng từ BXH, Prediction hoặc Event sẽ có thời hạn sử dụng.</li>
                  <li>Credit vĩnh viễn từ các gói trả phí không bị hết hạn.</li>
                  <li>Gia hạn sản phẩm chỉ sử dụng Credit vĩnh viễn.</li>
                  <li>Hệ thống được thiết kế để đảm bảo tính công bằng và cạnh tranh giữa tất cả người dùng.</li>
                </ul>
              </section>

              <div className="text-center pb-4 pt-2">
                <p className="text-[#FFC857] font-bold text-lg">Chúc bạn leo BXH thành công và mang về thật nhiều phần thưởng! 🚀</p>
              </div>

            </div>
          </DialogContent>
        </Dialog>

        {/* Reward Modal - Used specifically for Prediction Success Feedback */}
        <Dialog open={showRewardModal} onOpenChange={setShowRewardModal}>
          <DialogContent className="bg-[#1a0a0f] border-white/10 text-white sm:max-w-[400px] text-center">
            <DialogHeader>
              <DialogTitle className="text-xl text-center text-emerald-400">Dự đoán thành công!</DialogTitle>
            </DialogHeader>
            <div className="py-6 flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
                <Target className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-white/70 mb-6">
                Dự đoán của bạn đã được ghi nhận. Hãy quay lại vào cuối tuần để nhận thưởng nếu dự đoán chính xác nhé!
              </p>
              <button
                onClick={() => setShowRewardModal(false)}
                className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors"
              >
                Đóng
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Demo Popup */}
        <Dialog open={showDemoPopup} onOpenChange={setShowDemoPopup}>
          <DialogContent className="bg-[#1a0a0f] border-white/10 text-white sm:max-w-[400px] text-center">
            <DialogHeader>
              <DialogTitle className="text-xl text-center text-[#FFC857]">Thông báo cập nhật</DialogTitle>
            </DialogHeader>
            <div className="py-6 flex flex-col items-center">
              <div className="w-16 h-16 bg-[#FFC857]/10 rounded-full flex items-center justify-center mb-4 border border-[#FFC857]/20">
                <Info className="w-8 h-8 text-[#FFC857]" />
              </div>
              <p className="text-white/70 mb-6">
                Tính năng Bảng Xếp Hạng Tuần hiện tại chỉ là giao diện demo mô phỏng. Các chức năng và dữ liệu bên trong chưa chính thức đi vào hoạt động!
              </p>
              <button
                onClick={() => setShowDemoPopup(false)}
                className="w-full py-3 bg-gradient-to-r from-[#FF7A00] to-[#FFC857] text-neutral-900 rounded-xl font-bold transition-all hover:shadow-[0_0_15px_rgba(255,122,0,0.4)]"
              >
                Đã hiểu
              </button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </TooltipProvider>
  );
}