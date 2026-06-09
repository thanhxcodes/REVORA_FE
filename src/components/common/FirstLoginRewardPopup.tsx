import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Gift, X } from 'lucide-react';

interface FirstLoginRewardPopupProps {
  onClose: () => void;
}

const FirstLoginRewardPopup: React.FC<FirstLoginRewardPopupProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Delay slightly to allow layout to settle
    const timer = setTimeout(() => {
      setIsVisible(true);
      fireConfetti();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const fireConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#2D5A3D', '#FFD700', '#FF6347', '#4169E1']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#2D5A3D', '#FFD700', '#FF6347', '#4169E1']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for fade out animation
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Popup Content */}
      <div className={`relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center transform transition-all duration-500 ease-out ${isVisible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-8'}`}>
        {/* Close Icon (Optional, but user said 1 button so we can omit or keep small) */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Gift Icon */}
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-[#2D5A3D]/30 animate-bounce">
          <Gift className="w-12 h-12 text-white" />
        </div>

        {/* Text content */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Chào mừng bạn mới!</h2>
        <p className="text-gray-600 mb-6">
          Bạn vừa được tặng <span className="font-bold text-[#2D5A3D]">2 lượt sử dụng Quà Tặng Tân Thủ</span> vào tài khoản. Hãy trải nghiệm REVORA ngay nhé!
        </p>

        {/* Action Button */}
        <button
          onClick={handleClose}
          className="w-full py-3.5 bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[#2D5A3D]/25 hover:-translate-y-0.5 transition-all"
        >
          Xác nhận
        </button>
      </div>
    </div>
  );
};

export default FirstLoginRewardPopup;
