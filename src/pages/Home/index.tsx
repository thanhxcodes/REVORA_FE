import { useState, useEffect } from 'react';
import { ChevronRight, Sparkles, TrendingUp, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCarousel from '../Products/components/ProductCarousel';
import BannerCarousel from './components/BannerCarousel';
import { getFeaturedProductsAPI, getNewestProductsAPI, getLovedProductsAPI } from '../../features/products/services/productApi';
import { ProductResponseDto } from '../../features/products/types';

const categories = [
  { name: 'Quần Áo', image: 'https://images.unsplash.com/photo-1495121605193-b116b5b9c5fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { name: 'Giày Dép', image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { name: 'Túi Xách', image: 'https://images.unsplash.com/photo-1705909237050-7a7625b47fac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { name: 'Phụ Kiện', image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { name: 'Đồng Hồ', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { name: 'Kính Mắt', image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
];

export default function HomePage() {
  // State lưu trữ dữ liệu thật
  const [featuredProducts, setFeaturedProducts] = useState<ProductResponseDto[]>([]);
  const [bestSellers, setBestSellers] = useState<ProductResponseDto[]>([]);
  const [newestProducts, setNewestProducts] = useState<ProductResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Gọi API lấy dữ liệu trang chủ
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setIsLoading(true);
        // Chạy đồng thời cả 3 request để tăng tốc độ tải trang
        const [featuredRes, lovedRes, newestRes] = await Promise.all([
          getFeaturedProductsAPI(10),
          getLovedProductsAPI(10),
          getNewestProductsAPI(10)
        ]);

        if (featuredRes.success) setFeaturedProducts(featuredRes.data);
        if (lovedRes.success) setBestSellers(lovedRes.data);
        if (newestRes.success) setNewestProducts(newestRes.data);
      } catch (error) {
        console.error("Lỗi tải dữ liệu trang chủ: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Tạo danh sách banner từ dữ liệu thật
  const banners = featuredProducts
    .filter(p => p.isPremium && p.bannerUrl)
    .map((p, index) => {
      const colors = [
        'from-[#1E4029]/75 to-[#2D5A3D]/60',
        'from-[#C4603A]/75 to-[#2D5A3D]/60',
        'from-[#2D5A3D]/75 to-[#3D7054]/60',
        'from-[#1E4029]/80 to-[#C4603A]/60',
      ];
      return {
        id: p.productId,
        title: p.title,
        subtitle: 'Sản phẩm nổi bật',
        image: p.bannerUrl!,
        color: colors[index % colors.length],
        link: `/product/${p.productId}`
      };
    });

  const displayBanners = banners.length > 0 ? banners : [
    {
      id: -1,
      title: 'Chào mừng đến với REVORA',
      subtitle: 'Khám phá những sản phẩm tuyệt vời nhất',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200',
      color: 'from-[#1E4029]/75 to-[#2D5A3D]/60',
      link: '/all-products'
    }
  ];

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      {/* Banner Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mb-8">
        {!isLoading && <BannerCarousel banners={displayBanners} />}
        {isLoading && (
          <div className="w-full h-[500px] rounded-3xl bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-[#2D5A3D]/20 border-t-[#2D5A3D] rounded-full animate-spin"></div>
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                to="/all-products"
                className="flex flex-col items-center space-y-3 group"
              >
                <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-all group-hover:scale-105">
                  <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-sm text-gray-700 font-medium group-hover:text-[#2D5A3D] transition-colors">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Tải dữ liệu... */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-[#2D5A3D]/20 border-t-[#2D5A3D] rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Featured Products Section */}
          {featuredProducts.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-xl">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl text-gray-900 font-bold">Sản Phẩm Nổi Bật</h2>
                    <p className="text-sm text-gray-600">Các sản phẩm được ưu tiên hiển thị</p>
                  </div>
                </div>
                <Link to="/all-products" className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white rounded-full hover:shadow-lg hover:scale-105 transition-all font-semibold">
                  <span>Tất Cả Sản Phẩm</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
              <ProductCarousel products={featuredProducts} itemsToShow={5} />
            </section>
          )}

          {/* Best Sellers Section */}
          {bestSellers.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl text-gray-900 font-bold">Được yêu thích nhất</h2>
                    <p className="text-sm text-gray-600">Top sản phẩm được quan tâm nhiều nhất</p>
                  </div>
                </div>
                <Link to="/all-products" className="flex items-center space-x-2 px-6 py-3 bg-white text-orange-600 rounded-full hover:shadow-lg transition-all font-semibold border-2 border-orange-500">
                  <span>Tất Cả Sản Phẩm</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
              <ProductCarousel products={bestSellers} itemsToShow={5} />
            </section>
          )}

          {/* Newest Products Section */}
          {newestProducts.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl text-gray-900 font-bold">Mới Nhất</h2>
                    <p className="text-sm text-gray-600">Sản phẩm vừa được đăng lên</p>
                  </div>
                </div>
                <Link to="/all-products" className="flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 rounded-full hover:shadow-lg transition-all font-semibold border-2 border-blue-500">
                  <span>Tất Cả Sản Phẩm</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
              <ProductCarousel products={newestProducts} itemsToShow={5} />
            </section>
          )}
        </>
      )}

      {/* Premium CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-gradient-to-r from-[#2D5A3D] via-[#3D7054] to-[#2D5A3D] rounded-3xl p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <Sparkles className="w-16 h-16 mx-auto mb-6 text-[#C4603A] animate-pulse" />
            <h2 className="text-4xl md:text-5xl mb-4 font-bold">Nâng Cấp Tài Khoản Premium</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Tăng độ hiển thị, ưu tiên trong tìm kiếm và nhiều tính năng độc quyền dành riêng cho bạn
            </p>
            <Link to="/plans" className="inline-block bg-white text-[#2D5A3D] px-10 py-4 rounded-full hover:shadow-2xl hover:scale-105 transition-all font-bold text-lg">
              Xem Gói Dịch Vụ Ngay
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}