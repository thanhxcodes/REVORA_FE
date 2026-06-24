import { useState, useEffect } from 'react';
import { ChevronRight, Sparkles, TrendingUp, Clock, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import ProductCarousel from '../Products/components/ProductCarousel';
import BannerCarousel from './components/BannerCarousel';
import { getFeaturedProductsAPI, getNewestProductsAPI, getLovedProductsAPI, getCategoriesAPI, getMostViewedProductsAPI } from '../../features/products/services/productApi';
import { ProductResponseDto } from '../../features/products/types';

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

const categories = [
  { name: 'Quần Áo', image: 'https://images.unsplash.com/photo-1495121605193-b116b5b9c5fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { name: 'Giày Dép', image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { name: 'Túi Xách', image: 'https://images.unsplash.com/photo-1705909237050-7a7625b47fac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { name: 'Phụ Kiện', image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { name: 'Đồng Hồ', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { name: 'Kính Mắt', image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
];

import bannerImg from '../../assets/images/banner.png';
import bannerImg2 from '../../assets/images/banner2.png';
import bannerImg3 from '../../assets/images/banner3.png';

export default function HomePage() {
  // State lưu trữ dữ liệu thật
  const [featuredProducts, setFeaturedProducts] = useState<ProductResponseDto[]>([]);
  const [bestSellers, setBestSellers] = useState<ProductResponseDto[]>([]);
  const [newestProducts, setNewestProducts] = useState<ProductResponseDto[]>([]);
  const [mostViewedProducts, setMostViewedProducts] = useState<ProductResponseDto[]>([]);
  const [apiCategories, setApiCategories] = useState<{ categoryId: number, name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Gọi API lấy dữ liệu trang chủ
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setIsLoading(true);
        // Chạy đồng thời cả 5 request để tăng tốc độ tải trang
        const [featuredRes, lovedRes, newestRes, viewedRes, catRes] = await Promise.all([
          getFeaturedProductsAPI(10),
          getLovedProductsAPI(10),
          getNewestProductsAPI(10),
          getMostViewedProductsAPI(10),
          getCategoriesAPI()
        ]);

        if (featuredRes.success) setFeaturedProducts(featuredRes.data);
        if (lovedRes.success) setBestSellers(lovedRes.data);
        if (newestRes.success) setNewestProducts(newestRes.data);
        if (viewedRes.success) setMostViewedProducts(viewedRes.data);
        if (catRes.success) setApiCategories(catRes.data);
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
      return {
        id: p.productId,
        title: p.title,
        subtitle: 'Sản phẩm nổi bật',
        image: p.bannerUrl!,
        color: 'from-transparent via-black/40 to-black/80',
        link: `/product/${p.productId}`
      };
    });

  const displayBanners = banners.length > 0 ? banners : [
    {
      id: -1,
      title: 'Chào mừng đến với REVORA',
      subtitle: 'Khám phá những sản phẩm tuyệt vời nhất',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200',
      color: 'from-transparent via-black/40 to-black/80',
      link: '/all-products'
    }
  ];

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      {/* Banner Carousel */}
      <motion.section 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mb-8"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {!isLoading && <BannerCarousel banners={displayBanners} />}
        {isLoading && (
          <div className="w-full h-[500px] rounded-3xl bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-[#2D5A3D]/20 border-t-[#2D5A3D] rounded-full animate-spin"></div>
          </div>
        )}
      </motion.section>

      {/* Categories */}
      <motion.section 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
      >
        <div className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow p-8 border border-gray-100">
          <motion.div 
            className="grid grid-cols-3 md:grid-cols-6 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {categories.map((category) => {
              const matchedCat = apiCategories.find(c => c.name.toLowerCase() === category.name.toLowerCase());
              const catId = matchedCat ? matchedCat.categoryId : '';
              return (
                <motion.div key={category.name} variants={staggerItem}>
                  <Link
                    to={`/all-products${catId ? `?category=${catId}` : ''}`}
                    className="flex flex-col items-center space-y-3 group"
                  >
                    <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm group-hover:shadow-xl transition-all group-hover:scale-105 group-hover:-translate-y-1">
                      <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm text-gray-700 font-semibold group-hover:text-[#2D5A3D] transition-colors">{category.name}</span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* Tải dữ liệu... */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-[#2D5A3D]/20 border-t-[#2D5A3D] rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Featured Products Section */}
          {featuredProducts.length > 0 && (
            <motion.section 
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={sectionVariants}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-xl shadow-sm">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl text-gray-900 font-bold tracking-tight">Sản Phẩm Nổi Bật</h2>
                    <p className="text-sm text-gray-500 mt-1">Các sản phẩm được ưu tiên hiển thị</p>
                  </div>
                </div>
                <Link to="/all-products?sort=featured" className="group flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white rounded-full hover:shadow-xl transition-all font-semibold">
                  <span>Tất Cả Sản Phẩm</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <ProductCarousel products={featuredProducts} itemsToShow={5} />
            </motion.section>
          )}

          {/* Best Sellers Section */}
          {bestSellers.length > 0 && (
            <motion.section 
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={sectionVariants}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-sm">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl text-gray-900 font-bold tracking-tight">Được Yêu Thích Nhất</h2>
                    <p className="text-sm text-gray-500 mt-1">Top sản phẩm được quan tâm nhiều nhất</p>
                  </div>
                </div>
                <Link to="/all-products?sort=loved" className="group flex items-center space-x-2 px-6 py-3 bg-white text-orange-600 rounded-full hover:shadow-md transition-all font-semibold border border-orange-200 hover:border-orange-500">
                  <span>Tất Cả Sản Phẩm</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <ProductCarousel products={bestSellers} itemsToShow={5} />
            </motion.section>
          )}

          {/* Most Viewed Products Section */}
          {mostViewedProducts.length > 0 && (
            <motion.section 
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={sectionVariants}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-sm">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl text-gray-900 font-bold tracking-tight">Được Xem Nhiều Nhất</h2>
                    <p className="text-sm text-gray-500 mt-1">Sản phẩm có lượt xem cao nhất</p>
                  </div>
                </div>
                <Link to="/all-products?sort=most-viewed" className="group flex items-center space-x-2 px-6 py-3 bg-white text-teal-600 rounded-full hover:shadow-md transition-all font-semibold border border-teal-200 hover:border-teal-500">
                  <span>Tất Cả Sản Phẩm</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <ProductCarousel products={mostViewedProducts} itemsToShow={5} />
            </motion.section>
          )}

          {/* Newest Products Section */}
          {newestProducts.length > 0 && (
            <motion.section 
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={sectionVariants}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-sm">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl text-gray-900 font-bold tracking-tight">Mới Nhất</h2>
                    <p className="text-sm text-gray-500 mt-1">Sản phẩm vừa được đăng lên</p>
                  </div>
                </div>
                <Link to="/all-products?sort=newest" className="group flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 rounded-full hover:shadow-md transition-all font-semibold border border-blue-200 hover:border-blue-500">
                  <span>Tất Cả Sản Phẩm</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <ProductCarousel products={newestProducts} itemsToShow={5} />
            </motion.section>
          )}
        </>
      )}

      {/* Premium CTA Section */}
      <motion.section 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <div 
          className="relative rounded-3xl p-12 text-center text-white overflow-hidden bg-[#0b1a12] shadow-2xl"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.12) 2px, transparent 0)',
            backgroundSize: '24px 24px'
          }}
        >
          {/* Animated Background */}
          
          <Sparkles className="absolute top-12 left-[15%] w-6 h-6 text-emerald-300 opacity-50 animate-pulse delay-150 pointer-events-none" />
          <Sparkles className="absolute bottom-16 right-[20%] w-5 h-5 text-emerald-400 opacity-70 animate-bounce delay-700 pointer-events-none" />
          <Sparkles className="absolute top-20 right-[10%] w-4 h-4 text-emerald-500 opacity-30 animate-pulse delay-500 pointer-events-none" />
          
          <div className="absolute -top-32 left-1/4 w-[400px] h-[400px] bg-[#2D5A3D]/40 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-[#C4603A]/20 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#2D5A3D]/40 border border-[#2D5A3D]/50 text-emerald-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase shadow-lg shadow-[#2D5A3D]/20 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Gói Credits REVORA
            </div>
            
            <h2 className="text-4xl md:text-5xl mb-4 font-black tracking-tight leading-tight">
              Nâng Cấp Tài Khoản{' '}
              <span
                className="italic"
                style={{ background: 'linear-gradient(90deg, #4ade80, #86efac)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                Premium
              </span>
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto font-medium leading-relaxed">
              Tăng độ hiển thị, ưu tiên trong tìm kiếm và nhiều tính năng độc quyền dành riêng cho bạn
            </p>
            <Link to="/plans" className="inline-block bg-white text-[#1A3A26] px-10 py-4 rounded-full hover:shadow-2xl hover:shadow-emerald-500/20 hover:scale-105 transition-all font-bold text-lg">
              Xem Gói Dịch Vụ Ngay
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}