import { Sparkles, Image, Zap, Calendar, TrendingUp, Video, Shield, Crown } from 'lucide-react';
import CreditDisplay from '../components/CreditDisplay';

const userCreditBatches = {
  posting: [
    { credits: 5, expiresDate: '22/05/2026', expiresIn: 3, packageName: 'Posting Day' },
    { credits: 30, expiresDate: '28/05/2026', expiresIn: 9, packageName: 'Posting Week' },
  ],
  featured: [
    { credits: 3, expiresDate: '24/05/2026', expiresIn: 5, packageName: 'Featured Day' },
    { credits: 15, expiresDate: '01/06/2026', expiresIn: 13, packageName: 'Featured Week' },
  ],
};

const postingPackages = [
  {
    id: 'posting-day',
    title: 'Posting Day',
    price: 19000,
    credits: 5,
    duration: 1,
    durationText: 'Valid for 1 Day',
    badge: 'For Quick Sellers',
    badgeColor: 'bg-blue-100 text-blue-800',
    features: [
      'Standard image listings',
      '7-day product display duration',
      'Access to buyer contact tools',
      'Standard marketplace visibility',
    ],
    cta: 'Buy Now',
  },
  {
    id: 'posting-week',
    title: 'Posting Week',
    price: 79000,
    credits: 30,
    duration: 7,
    durationText: 'Valid for 7 Days',
    badge: 'Most Popular',
    badgeColor: 'bg-purple-100 text-purple-800',
    popular: true,
    features: [
      'Everything in Posting Day',
      'Better posting value',
      'Priority moderation queue',
    ],
    cta: 'Choose Package',
  },
  {
    id: 'posting-month',
    title: 'Posting Month',
    price: 199000,
    credits: 120,
    duration: 30,
    durationText: 'Valid for 30 Days',
    badge: 'Best Savings',
    badgeColor: 'bg-green-100 text-green-800',
    features: [
      'Everything in Posting Week',
      'Best posting value',
      'Increased seller visibility',
    ],
    cta: 'Get Package',
  },
];

const featuredPackages = [
  {
    id: 'featured-day',
    title: 'Featured Day',
    price: 49000,
    credits: 3,
    duration: 1,
    durationText: 'Valid for 1 Day',
    badge: 'Boost Fast',
    badgeColor: 'bg-orange-100 text-orange-800',
    features: [
      'Short video upload',
      'Featured product border',
      'Increased visibility',
      'Trending eligibility',
    ],
    cta: 'Boost Now',
    gradient: 'from-orange-500 to-orange-600',
  },
  {
    id: 'featured-week',
    title: 'Featured Week',
    price: 149000,
    credits: 15,
    duration: 7,
    durationText: 'Valid for 7 Days',
    badge: 'Recommended',
    badgeColor: 'bg-pink-100 text-pink-800',
    popular: true,
    features: [
      'Everything in Featured Day',
      'Homepage recommendation priority',
      'Better discovery placement',
      'Verified seller badge during boost',
    ],
    cta: 'Upgrade Visibility',
    gradient: 'from-orange-600 to-orange-700',
  },
  {
    id: 'featured-month',
    title: 'Featured Month',
    price: 349000,
    credits: 50,
    duration: 30,
    durationText: 'Valid for 30 Days',
    badge: 'Ultimate Boost',
    badgeColor: 'bg-yellow-100 text-yellow-800',
    features: [
      'Everything in Featured Week',
      'Highest visibility priority',
      'Top trending placement',
      'Premium animated listing effect',
      'Maximum recommendation priority',
    ],
    cta: 'Unlock Premium Exposure',
    gradient: 'from-orange-700 to-red-600',
  },
];

export default function PackagesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl text-gray-900 mb-4">Boost Your Fashion Listings</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect package to increase visibility, upload products, and stand out in the REVORA fashion community.
          </p>
        </div>

        {/* Current Credits Dashboard */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-16">
          <div className="mb-6">
            <h2 className="text-2xl text-gray-900 mb-2">Credits Hiện Tại</h2>
            <p className="text-gray-600">Di chuột vào icon (i) để xem chi tiết từng gói credit</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CreditDisplay type="posting" batches={userCreditBatches.posting} />
            <CreditDisplay type="featured" batches={userCreditBatches.featured} />
          </div>
        </div>

        {/* Posting Packages Section */}
        <div className="mb-16">
          <div className="flex items-center space-x-3 mb-8">
            <Image className="w-8 h-8 text-blue-600" />
            <h2 className="text-3xl text-gray-900">Posting Packages</h2>
            <span className="text-gray-500">(Gói Đăng Bài)</span>
          </div>
          <p className="text-gray-600 mb-8">Used to create standard product listings with image uploads.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {postingPackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all p-8 border-2 ${
                  pkg.popular ? 'border-purple-400 scale-105' : 'border-gray-200'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm px-6 py-1 rounded-full shadow-lg">
                    {pkg.badge}
                  </div>
                )}
                {!pkg.popular && (
                  <div className={`inline-block ${pkg.badgeColor} text-xs px-4 py-1 rounded-full mb-4`}>
                    {pkg.badge}
                  </div>
                )}

                <h3 className="text-2xl text-gray-900 mb-2 mt-2">{pkg.title}</h3>

                <div className="mb-6">
                  <div className="text-4xl text-blue-600 mb-2">{pkg.price.toLocaleString('vi-VN')}đ</div>
                  <div className="text-lg text-gray-700 mb-1">{pkg.credits} Credit Đăng Tin</div>
                  <div className="text-sm text-gray-500">{pkg.durationText}</div>
                </div>

                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                      <span className="text-blue-500 mt-0.5">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-3 rounded-full transition-all ${
                  pkg.popular
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                    : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}>
                  {pkg.cta}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Packages Section */}
        <div>
          <div className="flex items-center space-x-3 mb-8">
            <Zap className="w-8 h-8 text-orange-600" />
            <h2 className="text-3xl text-gray-900">Featured Packages</h2>
            <span className="text-gray-500">(Gói Nổi Bật)</span>
          </div>
          <p className="text-gray-600 mb-8">
            Used to boost products and unlock premium selling features: short video upload, featured borders, homepage boosting, trending feed appearance, recommendation priority.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative rounded-3xl shadow-xl hover:shadow-2xl transition-all p-8 overflow-hidden group ${
                  pkg.popular ? 'scale-105' : ''
                }`}
                style={{
                  background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${pkg.gradient}`}></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 group-hover:scale-150 transition-transform duration-500"></div>

                <div className="relative text-white">
                  {pkg.popular && (
                    <div className="absolute -top-4 -right-4 bg-[#C4603A] text-white text-xs px-4 py-1 rounded-full shadow-lg">
                      {pkg.badge}
                    </div>
                  )}
                  {!pkg.popular && (
                    <div className={`inline-block bg-white/20 backdrop-blur-sm text-white text-xs px-4 py-1 rounded-full mb-4`}>
                      {pkg.badge}
                    </div>
                  )}

                  <h3 className="text-2xl mb-2 mt-2">{pkg.title}</h3>

                  <div className="mb-6">
                    <div className="text-4xl mb-2">{pkg.price.toLocaleString('vi-VN')}đ</div>
                    <div className="text-lg text-white/90 mb-1">{pkg.credits} Credit Nổi Bật</div>
                    <div className="text-sm text-white/70">{pkg.durationText}</div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-white/90">
                        <span className="text-[#C4603A] mt-0.5">★</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button className="w-full py-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all border border-white/30 hover:scale-105">
                    {pkg.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-16 bg-white rounded-3xl shadow-lg p-12">
          <h2 className="text-3xl text-gray-900 mb-8 text-center">How Credits Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Image className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl text-gray-900">Credit Đăng Tin</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Each time you post a product, 1 posting credit is used. Credits expire after the package duration.
              </p>
              <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700">
                <span className="font-bold">Example:</span> Buy "Posting Week" → Get 30 credits valid for 7 days → Use 1 credit per post
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl text-gray-900">Credit Nổi Bật</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Use featured credits to boost products with video, premium borders, trending placement, and homepage visibility.
              </p>
              <div className="bg-orange-50 rounded-xl p-4 text-sm text-gray-700">
                <span className="font-bold">Example:</span> Buy "Featured Week" → Get 15 credits valid for 7 days → Use credits to boost your best items
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
