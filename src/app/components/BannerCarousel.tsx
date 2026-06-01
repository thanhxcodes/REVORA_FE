import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const banners = [
  {
    id: 1,
    title: 'Bộ Sưu Tập Mùa Hè 2024',
    subtitle: 'Khám phá những item độc đáo',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200',
    color: 'from-[#1E4029]/75 to-[#2D5A3D]/60',
  },
  {
    id: 2,
    title: 'Vintage Leather Collection',
    subtitle: 'Phong cách retro đẳng cấp',
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=1200',
    color: 'from-[#C4603A]/75 to-[#2D5A3D]/60',
  },
  {
    id: 3,
    title: 'Túi Xách Cao Cấp',
    subtitle: 'Designer bags chính hãng',
    image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1200',
    color: 'from-[#2D5A3D]/75 to-[#3D7054]/60',
  },
  {
    id: 4,
    title: 'Sneakers Limited Edition',
    subtitle: 'Giày thể thao hot nhất',
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200',
    color: 'from-[#1E4029]/80 to-[#C4603A]/60',
  },
];

export default function BannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl">
      {/* Banner Slides */}
      <div className="relative h-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${banner.color}`} />
            <div className="absolute inset-0 flex items-center justify-center text-white text-center px-8">
              <div>
                <h2 className="text-5xl font-bold mb-4 drop-shadow-lg">{banner.title}</h2>
                <p className="text-2xl drop-shadow-lg">{banner.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Previous Button */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-all group"
      >
        <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Next Button */}
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-all group"
      >
        <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all ${
              index === currentIndex
                ? 'w-8 h-3 bg-white rounded-full'
                : 'w-3 h-3 bg-white/50 rounded-full hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
