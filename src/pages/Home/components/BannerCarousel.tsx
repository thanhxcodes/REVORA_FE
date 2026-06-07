import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  color: string;
  link: string;
}

interface BannerCarouselProps {
  banners: Banner[];
}

export default function BannerCarousel({ banners }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  }, [banners.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      handleNext();
    }, 4000); 

    return () => clearInterval(timer);
  }, [handleNext, banners.length]);

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl group">
      {/* Banner Slides */}
      <div className="relative h-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 bg-gradient-to-l ${banner.color}`} />
            <div className="absolute inset-0 flex flex-col items-end justify-center text-white text-right px-12 md:px-24">
              <motion.div 
                className="max-w-xl"
                animate={index === currentIndex ? { y: [0, -8, 0] } : {}}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <h2 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] tracking-tight text-white">{banner.title}</h2>
                <p className="text-xl md:text-2xl drop-shadow-md opacity-95 mb-8 font-medium text-gray-100">{banner.subtitle}</p>
                <Link to={banner.link} className="inline-flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30 text-white px-10 py-3.5 rounded-full font-bold hover:bg-white/30 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)]">
                  Xem Ngay
                </Link>
              </motion.div>
            </div>
          </div>
        ))}
      </div>

      {/* Previous Button */}
      {banners.length > 1 && (
        <button
          onClick={handlePrev}
          className="absolute z-20 left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft className="w-6 h-6 text-white hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Next Button */}
      {banners.length > 1 && (
        <button
          onClick={handleNext}
          className="absolute z-20 right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronRight className="w-6 h-6 text-white hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute z-20 bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 h-3 bg-white rounded-full'
                  : 'w-3 h-3 bg-white/50 rounded-full hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}