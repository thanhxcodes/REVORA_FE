import React, { useState, useEffect, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authClient } from '../../providers/authProvider/authService';
import { useAuth } from '../../providers/authProvider/AuthContext';

interface Announcement {
  announcementId: number;
  title: string;
  description: string;
  imageUrl: string | null;
  redirectUrl: string;
  buttonText: string;
  badgeText?: string;
  priority: number;
  startAt: string;
  endAt: string;
  isActive: boolean;
  createdAt: string;
}

export default function AnnouncementPopup() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hiddenAnnouncements, setHiddenAnnouncements] = useState<Record<number, boolean>>({});
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      if (!currentUser) return;
      if (sessionStorage.getItem('revora_announcement_shown') === 'true') {
        return;
      }

      try {
        const response = await authClient.get('/Announcement/active');
        if (response.data?.success && response.data.data && response.data.data.length > 0) {
          const allAnnouncements: Announcement[] = response.data.data;
          const today = new Date().toDateString();

          const visibleAnnouncements = allAnnouncements.filter((a) => {
            const key = `hide_announcement_${currentUser.id}_${a.announcementId}_${today}`;
            return localStorage.getItem(key) !== 'true';
          });

          if (visibleAnnouncements.length > 0) {
            setAnnouncements(visibleAnnouncements);
            setIsVisible(true);
            sessionStorage.setItem('revora_announcement_shown', 'true');
          }
        }
      } catch (error) {
        console.error('Failed to fetch announcements', error);
      }
    };

    fetchAnnouncements();
  }, [currentUser]);

  const topPriorities = useMemo(() => {
    if (!announcements.length) return [];
    return Array.from(new Set(announcements.map(a => a.priority)))
      .sort((a, b) => a - b)
      .slice(0, 3);
  }, [announcements]);

  if (!isVisible || announcements.length === 0) return null;

  const current = announcements[currentIndex];
  // Determine if we should show a badge.
  // We strictly use current.badgeText from DB.
  const displayBadgeText = current.badgeText;

  const safeTitle = current.title ? current.title.normalize('NFC') : '';
  const safeDescription = current.description ? current.description.normalize('NFC') : '';

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === announcements.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? announcements.length - 1 : prev - 1));
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleLater = () => {
    if (currentIndex < announcements.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsVisible(false);
    }
  };

  const handleAction = () => {
    navigate(current.redirectUrl);
    setIsVisible(false);
  };

  const handleToggleHideToday = () => {
    if (!currentUser) return;
    const today = new Date().toDateString();
    const key = `hide_announcement_${currentUser.id}_${current.announcementId}_${today}`;

    const isCurrentlyHidden = hiddenAnnouncements[current.announcementId] || false;

    if (isCurrentlyHidden) {
      localStorage.removeItem(key);
      setHiddenAnnouncements(prev => ({ ...prev, [current.announcementId]: false }));
    } else {
      localStorage.setItem(key, 'true');
      setHiddenAnnouncements(prev => ({ ...prev, [current.announcementId]: true }));
    }
  };

  const isCurrentHidden = hiddenAnnouncements[current.announcementId] || false;
  const fallbackImage = "https://res.cloudinary.com/dh4ut3b4x/image/upload/v1781037903/REVORA_Media/Products/User_4/mjitp5f6g9ftqaxra1su.jpg";

  return (
    /* THAY ĐỔI TẠI ĐÂY: Thêm onClick={handleClose} cho lớp nền bọc ngoài */
    <div
      onClick={handleClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-all duration-500 animate-in fade-in cursor-pointer"
    >

      {/* THAY ĐỔI TẠI ĐÂY: 
          1. Thêm onClick={(e) => e.stopPropagation()} để chặn đóng popup khi nhấn vào vùng nội dung 
          2. Thêm cursor-default để khôi phục con trỏ chuột bình thường khi rê vào bên trong */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-neutral-900 border border-neutral-800 text-white rounded-2xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9)] w-[95vw] md:w-[85vw] max-w-[1100px] h-[85vh] md:h-[580px] overflow-hidden relative flex flex-col md:flex-row animate-in zoom-in-95 duration-300 cursor-default"
      >

        {/* Nút Đóng */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 p-2.5 bg-black/40 hover:bg-black/80 backdrop-blur-md text-neutral-400 hover:text-white rounded-full transition-all duration-200 z-30 border border-neutral-700/50"
        >
          <X className="w-4 h-4 md:w-5 h-5" />
        </button>

        {/* CỘT TRÁI: Hình ảnh */}
        <div className="w-full md:w-1/2 h-[35%] md:h-full relative bg-neutral-950 shrink-0 overflow-hidden group">
          <div
            key={`img-${current.announcementId}`}
            className="w-full h-full animate-in fade-in zoom-in-105 duration-700 fill-mode-both"
          >
            <img
              src={current.imageUrl || fallbackImage}
              srcSet={`${current.imageUrl || fallbackImage} 2x`}
              alt={safeTitle}
              className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-black/20 md:bg-gradient-to-r md:from-transparent md:to-neutral-900/90" />

          {/* Điều hướng Mobile */}
          {announcements.length > 1 && (
            <div className="absolute bottom-4 right-4 flex gap-1.5 md:hidden z-20">
              <button onClick={handlePrev} className="p-2 bg-black/60 backdrop-blur-sm rounded-lg text-white border border-neutral-800"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={handleNext} className="p-2 bg-black/60 backdrop-blur-sm rounded-lg text-white border border-neutral-800"><ChevronRight className="w-4 h-4" /></button>
            </div>
          )}
        </div>

        {/* CỘT PHẢI: Nội dung */}
        <div className="w-full md:w-1/2 h-[65%] md:h-full flex flex-col p-6 md:p-12 relative bg-neutral-900 justify-between">

          {/* Badge HOT */}
          {displayBadgeText && (
            <div className="absolute top-6 left-6 md:top-8 md:left-12 flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] md:text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-md z-10 pointer-events-none">
              <Sparkles className="w-3 h-3 animate-spin duration-1000" />
              <span>{displayBadgeText}</span>
            </div>
          )}

          {/* Khu vực text chính */}
          <div
            key={`content-${current.announcementId}`}
            className="flex-1 flex flex-col justify-center pt-4 md:pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto scrollbar-none"
          >
            <span className="text-[11px] font-bold tracking-[0.1em] text-neutral-400 mb-2 block antialiased">
              BẢN TIN ĐẶC BIỆT
            </span>
            <h2 className="text-2xl md:text-[32px] font-bold text-neutral-100 mb-4 leading-snug tracking-wide font-sans antialiased">
              {safeTitle}
            </h2>
            <p className="text-neutral-400 text-sm md:text-base leading-relaxed font-light max-w-[95%] antialiased">
              {safeDescription}
            </p>
          </div>

          {/* Hệ thống nút bấm */}
          <div className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAction}
                className="flex-1 order-1 sm:order-2 py-3.5 px-6 bg-neutral-100 hover:bg-white text-neutral-950 rounded-xl font-medium text-sm md:text-base transition-all duration-300 shadow-lg hover:shadow-white/5 active:scale-[0.99] flex items-center justify-center tracking-wide"
              >
                {current.buttonText}
              </button>

              <button
                onClick={handleLater}
                className="flex-1 order-2 sm:order-1 py-3.5 text-neutral-400 hover:text-white font-medium rounded-xl transition-all border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/30 text-sm"
              >
                Để xem sau
              </button>
            </div>

            <div className="h-px bg-neutral-800 w-full my-1" />

            {/* Custom Toggle Switch */}
            <div className="flex items-center justify-between py-1">
              <span className="text-neutral-500 text-xs font-light tracking-wide select-none">
                Không nhắc lại sự kiện này trong hôm nay
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isCurrentHidden}
                  onChange={handleToggleHideToday}
                />
                <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 peer-checked:after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>
          </div>

          {/* Thanh Indicator ở chân Desktop */}
          {announcements.length > 1 && (
            <div className="hidden md:flex items-center justify-between mt-6 pt-2 border-t border-neutral-800/60">
              <div className="flex gap-1.5">
                {announcements.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-amber-500' : 'w-1.5 bg-neutral-700'}`}
                  />
                ))}
              </div>

              <div className="flex gap-1">
                <button onClick={handlePrev} className="p-1.5 text-neutral-500 hover:text-white transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                <span className="text-xs text-neutral-600 self-center font-mono">{currentIndex + 1} / {announcements.length}</span>
                <button onClick={handleNext} className="p-1.5 text-neutral-500 hover:text-white transition-colors"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}