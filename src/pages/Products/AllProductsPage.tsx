import { useState, useEffect } from 'react';
import { Filter, ChevronDown, Grid3x3, List, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './components/ProductCard';
import { getFilteredProductsAPI, getCategoriesAPI } from '../../features/products/services/productApi';
import { useSearchParams } from 'react-router-dom';
import { ProductResponseDto } from '../../features/products/types';

const LOCATIONS = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng'];
const BRANDS = ['Gucci', 'Chanel', 'Apple', 'Samsung', '5TheWay', 'First News', 'Logitech', 'No Brand'];
const CONDITIONS = ['Mới 100%', 'Như Mới', 'Tuyệt Vời', 'Tốt', 'Khá'];

// CÁC MỐC GIÁ CHUẨN E-COMMERCE
const PRICE_RANGES = [
  { label: 'Tất cả mức giá', min: 0, max: 1000000000 }, // Max 1 Tỷ
  { label: 'Dưới 500.000₫', min: 0, max: 500000 },
  { label: '500.000₫ - 1.000.000₫', min: 500000, max: 1000000 },
  { label: '1.000.000₫ - 3.000.000₫', min: 1000000, max: 3000000 },
  { label: '3.000.000₫ - 5.000.000₫', min: 3000000, max: 5000000 },
  { label: '5.000.000₫ - 10.000.000₫', min: 5000000, max: 10000000 },
  { label: 'Trên 10.000.000₫', min: 10000000, max: 1000000000 },
];

type ViewMode = 'grid' | 'list';

export default function AllProductsPage() {
  const [searchParams] = useSearchParams();
  const searchKeyword = searchParams.get('search') || '';
  const urlCategory = searchParams.get('category');

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(true);
  
  // Dữ liệu Động từ BE
  const [categories, setCategories] = useState<{categoryId: number, name: string}[]>([]);
  const [products, setProducts] = useState<ProductResponseDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // States lọc dữ liệu
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [selectedCategory, setSelectedCategory] = useState<number>(urlCategory ? Number(urlCategory) : 0);
  const [selectedLocation, setSelectedLocation] = useState('Tất Cả');
  const [selectedBrand, setSelectedBrand] = useState('Tất Cả');
  const [selectedCondition, setSelectedCondition] = useState('Tất Cả');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000000]);
  const [sortBy, setSortBy] = useState<'newest' | 'priceAsc' | 'priceDesc' | 'popular'>('newest');

  // Load danh mục 1 lần khi vào trang
  useEffect(() => {
    const fetchCats = async () => {
      const res = await getCategoriesAPI();
      if (res.success) setCategories(res.data);
    };
    fetchCats();
  }, []);

  // Cập nhật selectedCategory nếu URL thay đổi (nhấn back/forward)
  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(Number(urlCategory));
    } else {
      setSelectedCategory(0);
    }
  }, [urlCategory]);

  // Gọi API lấy dữ liệu Sản Phẩm mỗi khi các bộ lọc thay đổi
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const result = await getFilteredProductsAPI({
          keyword: searchKeyword ? searchKeyword : undefined,
          categoryId: selectedCategory === 0 ? undefined : selectedCategory,
          city: selectedLocation === 'Tất Cả' ? undefined : selectedLocation,
          brand: selectedBrand === 'Tất Cả' ? undefined : selectedBrand,
          condition: selectedCondition === 'Tất Cả' ? undefined : selectedCondition,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          sortBy: sortBy,
          pageNumber: currentPage,
          pageSize: itemsPerPage
        });

        if (result.success) {
          setProducts(result.data.items);
          setTotalCount(result.data.totalCount);
          setTotalPages(result.data.totalPages);
        }
      } catch (error) {
        console.error("Lỗi lấy sản phẩm", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [searchKeyword, selectedCategory, selectedLocation, selectedBrand, selectedCondition, priceRange, sortBy, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setSelectedCategory(0);
    setSelectedLocation('Tất Cả');
    setSelectedBrand('Tất Cả');
    setSelectedCondition('Tất Cả');
    setPriceRange([0, 1000000000]);
    setCurrentPage(1);
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl text-gray-900 mb-2 font-bold">
            {searchKeyword ? `Kết quả tìm kiếm cho: "${searchKeyword}"` : 'Tất Cả Sản Phẩm'}
          </h1>
          <p className="text-gray-600">
            Tìm thấy <span className="font-semibold text-[#2D5A3D]">{totalCount}</span> sản phẩm phù hợp
          </p>
        </div>

        {/* Đã sửa thành flex-col trên mobile, flex-row trên PC để Sidebar nhảy sang phải */}
        <div className="flex flex-col md:flex-row gap-8 relative items-start">
          
          {/* Main Content (TRÁI) */}
          <div className="flex-1 w-full order-2 md:order-1">
            
            {/* Toolbar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm font-medium text-gray-700"
                >
                  <Filter className="w-4 h-4 text-[#2D5A3D]" />
                  {showFilters ? 'Ẩn Bộ Lọc' : 'Hiện Bộ Lọc'}
                </button>

                <div className="hidden sm:flex items-center gap-2 border-l border-gray-200 pl-4">
                  <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#2D5A3D]/10 text-[#2D5A3D]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                    <Grid3x3 className="w-5 h-5" />
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#2D5A3D]/10 text-[#2D5A3D]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-600 hidden sm:block">Sắp xếp:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/20 focus:border-[#2D5A3D] text-sm font-medium text-gray-700 cursor-pointer"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="priceAsc">Giá: Thấp đến Cao</option>
                  <option value="priceDesc">Giá: Cao đến Thấp</option>
                </select>
              </div>
            </div>

            {/* Danh sách SP */}
            {isLoading ? (
               <div className="flex flex-col items-center justify-center py-32 opacity-70">
                 <div className="w-12 h-12 border-4 border-[#2D5A3D]/20 border-t-[#2D5A3D] rounded-full animate-spin mb-4"></div>
                 <p className="text-gray-500 font-medium">Đang tìm kiếm sản phẩm...</p>
               </div>
            ) : products.length > 0 ? (
              <>
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                  {products.map((product) => (
                    <ProductCard key={product.productId} {...product} viewMode={viewMode} />
                  ))}
                </div>

                {/* Phân Trang */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex gap-1.5">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`min-w-[40px] h-10 rounded-lg font-medium transition-all ${
                                currentPage === page ? 'bg-[#2D5A3D] text-white shadow-md' : 'border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return <span key={page} className="flex items-center justify-center w-8 text-gray-400">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center bg-white rounded-3xl p-16 shadow-sm border border-gray-100">
                <div className="text-6xl mb-6 opacity-30">🔍</div>
                <h3 className="text-xl text-gray-900 mb-2 font-bold">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">Rất tiếc, không có sản phẩm nào phù hợp với các tiêu chí lọc hiện tại. Thử điều chỉnh lại khoảng giá hoặc xóa bộ lọc.</p>
                <button
                  onClick={resetFilters}
                  className="px-8 py-3 bg-[#2D5A3D] text-white font-medium rounded-full hover:bg-[#234830] transition-colors shadow-md hover:shadow-lg"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}
          </div>

          {/* Filters Sidebar (PHẢI) */}
          {showFilters && (
            <aside className="w-full md:w-72 flex-shrink-0 sticky top-24 order-1 md:order-2">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-[#2D5A3D]" />
                    Lọc Sản Phẩm
                  </h2>
                  <button onClick={resetFilters} className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors bg-orange-50 px-3 py-1.5 rounded-lg">
                    Đặt lại
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">Danh Mục</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/20 focus:border-[#2D5A3D] text-sm text-gray-700 cursor-pointer"
                    >
                      <option value={0}>Tất Cả Danh Mục</option>
                      {categories.map((cat) => (
                        <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price Ranges Filter (RADIO BUTTONS) */}
                  <div className="pt-4 border-t border-gray-100">
                    <label className="block text-sm font-bold text-gray-900 mb-4">Khoảng Giá</label>
                    <div className="space-y-3">
                      {PRICE_RANGES.map((range, index) => {
                        const isChecked = priceRange[0] === range.min && priceRange[1] === range.max;
                        return (
                          <label key={index} className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isChecked ? 'border-[#2D5A3D]' : 'border-gray-300 group-hover:border-[#2D5A3D]/50'}`}>
                              {isChecked && <div className="w-2.5 h-2.5 rounded-full bg-[#2D5A3D]" />}
                            </div>
                            <input
                              type="radio"
                              name="priceRange"
                              className="hidden"
                              checked={isChecked}
                              onChange={() => {
                                setPriceRange([range.min, range.max]);
                                setCurrentPage(1);
                              }}
                            />
                            <span className={`text-sm transition-colors ${isChecked ? 'text-[#2D5A3D] font-bold' : 'text-gray-600 group-hover:text-gray-900 font-medium'}`}>
                              {range.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Location Filter */}
                  <div className="pt-4 border-t border-gray-100">
                    <label className="block text-sm font-bold text-gray-900 mb-3">Khu Vực</label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => {
                        setSelectedLocation(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/20 focus:border-[#2D5A3D] text-sm text-gray-700 cursor-pointer"
                    >
                      <option value="Tất Cả">Toàn Quốc</option>
                      {LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                  </div>

                  {/* Brand Filter */}
                  <div className="pt-4 border-t border-gray-100">
                    <label className="block text-sm font-bold text-gray-900 mb-3">Thương Hiệu</label>
                    <select
                      value={selectedBrand}
                      onChange={(e) => {
                        setSelectedBrand(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/20 focus:border-[#2D5A3D] text-sm text-gray-700 cursor-pointer"
                    >
                      <option value="Tất Cả">Tất Cả Thương Hiệu</option>
                      {BRANDS.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
                    </select>
                  </div>

                  {/* Condition Filter */}
                  <div className="pt-4 border-t border-gray-100">
                    <label className="block text-sm font-bold text-gray-900 mb-3">Tình Trạng</label>
                    <select
                      value={selectedCondition}
                      onChange={(e) => {
                        setSelectedCondition(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/20 focus:border-[#2D5A3D] text-sm text-gray-700 cursor-pointer"
                    >
                      <option value="Tất Cả">Mọi Tình Trạng</option>
                      {CONDITIONS.map((cond) => <option key={cond} value={cond}>{cond}</option>)}
                    </select>
                  </div>

                </div>
              </div>
            </aside>
          )}

        </div>
      </div>
    </div>
  );
}