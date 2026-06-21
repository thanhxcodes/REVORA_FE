import { useState, useEffect } from 'react';

interface CreditExpirationTextProps {
  expiresAtIso: string | null;
  expiresIn?: number;
  className?: string;
  urgentClassName?: string;
}

export function CreditExpirationText({ expiresAtIso, expiresIn, className = '', urgentClassName = '' }: CreditExpirationTextProps) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!expiresAtIso) return;

    const calculateTimeLeft = () => {
      const utcString = expiresAtIso.endsWith('Z') ? expiresAtIso : `${expiresAtIso}Z`;
      const expiryDate = new Date(utcString);
      const now = new Date();

      const diffInMs = expiryDate.getTime() - now.getTime();
      
      if (diffInMs <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffInMs % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAtIso]);

  if (!expiresAtIso) return null;

  if (timeLeft) {
    // Nếu còn từ 1 ngày trở lên (chính xác >= 24 giờ), hiển thị số ngày
    if (timeLeft.days >= 1) {
      // Để đồng nhất với cách tính cũ, số ngày = timeLeft.days + (có dư giờ thì +1) 
      // Tuy nhiên nếu người dùng muốn thấy chính xác "Còn X ngày" theo cách làm tròn lên (như cũ)
      const displayDays = expiresIn !== undefined ? expiresIn : timeLeft.days + (timeLeft.hours > 0 ? 1 : 0);
      return (
        <div className={`${className} ${displayDays <= 3 ? urgentClassName : ''}`}>
          Còn {displayDays} ngày
        </div>
      );
    }

    // Dưới 1 ngày (dưới 24h)
    const pad = (num: number) => String(num).padStart(2, '0');
    return (
      <div className={`${className} ${urgentClassName} font-mono`}>
        Còn: {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
      </div>
    );
  }

  // Fallback nếu chưa load xong timeLeft nhưng có expiresIn
  if (expiresIn !== undefined) {
    return (
      <div className={`${className} ${expiresIn <= 3 ? urgentClassName : ''}`}>
        Còn {expiresIn} ngày
      </div>
    );
  }

  return null;
}
