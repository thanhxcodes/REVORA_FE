import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import ProductCard from './ProductCard';

interface Product {
  id: number;
  image: string;
  title: string;
  price: number;
  condition: string;
  seller: string;
  views: number;
  isPremium?: boolean;
}

interface ProductCarouselProps {
  products: Product[];
  itemsToShow?: number;
}

export default function ProductCarousel({ products, itemsToShow = 5 }: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const maxIndex = Math.max(0, products.length - itemsToShow);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  useEffect(() => {
    if (containerRef.current) {
      const cardWidth = containerRef.current.scrollWidth / products.length;
      containerRef.current.scrollTo({
        left: currentIndex * cardWidth,
        behavior: 'smooth',
      });
    }
  }, [currentIndex, products.length]);

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < maxIndex;

  return (
    <div className="relative group">
      {/* Previous Button */}
      {canGoPrev && (
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
      )}

      {/* Carousel Container */}
      <div
        ref={containerRef}
        className="flex gap-6 overflow-hidden scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="flex-shrink-0"
            style={{ width: `calc((100% - ${(itemsToShow - 1) * 24}px) / ${itemsToShow})` }}
          >
            <ProductCard {...product} />
          </div>
        ))}
      </div>

      {/* Next Button */}
      {canGoNext && (
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>
      )}
    </div>
  );
}
