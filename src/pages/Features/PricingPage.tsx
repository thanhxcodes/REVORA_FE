import { Check, Star, Crown, Sparkles, Zap, Video, TrendingUp, Shield } from 'lucide-react';

const pricingPlans = [
  {
    name: 'Free Starter',
    price: 0,
    description: 'Perfect for trying out the platform',
    icon: Star,
    features: [
      '5 active listings',
      'Basic photo uploads (5 per listing)',
      '30-day listing duration',
      'Standard support',
      'Basic search visibility',
    ],
    color: 'from-gray-400 to-gray-500',
    borderColor: 'border-gray-300',
  },
  {
    name: 'Standard Basic',
    price: 9.99,
    period: '/month',
    description: 'Great for casual sellers',
    icon: Zap,
    features: [
      '15 active listings',
      'Enhanced photos (10 per listing)',
      '60-day listing duration',
      'Priority email support',
      'Better search ranking',
      'Sales analytics dashboard',
    ],
    color: 'from-blue-500 to-blue-600',
    borderColor: 'border-blue-400',
  },
  {
    name: 'Standard Plus',
    price: 19.99,
    period: '/month',
    description: 'Best for regular sellers',
    icon: TrendingUp,
    popular: true,
    features: [
      '40 active listings',
      'Premium photos (15 per listing)',
      '90-day listing duration',
      'Priority support (24/7)',
      'Featured in search results',
      'Advanced analytics',
      'Promotional badges',
      'Discount on platform fees',
    ],
    color: 'from-purple-500 to-purple-600',
    borderColor: 'border-purple-400',
  },
  {
    name: 'Standard Max',
    price: 34.99,
    period: '/month',
    description: 'For power sellers',
    icon: Shield,
    features: [
      '100 active listings',
      'Unlimited photos per listing',
      '120-day listing duration',
      'Dedicated account manager',
      'Top search placement',
      'Full analytics suite',
      'Verified seller badge',
      '15% platform fee discount',
      'Bulk upload tools',
    ],
    color: 'from-indigo-500 to-indigo-600',
    borderColor: 'border-indigo-400',
  },
  {
    name: 'Premium Silver',
    price: 49.99,
    period: '/month',
    description: 'Unlock video features',
    icon: Video,
    premium: true,
    features: [
      'Everything in Standard Max',
      'Video listings (30 sec per item)',
      'Featured video feed placement',
      'Premium seller badge',
      'Custom profile styling',
      'Priority customer support',
      '20% platform fee discount',
      'Early access to new features',
    ],
    color: 'from-[#2D5A3D] to-[#3D7054]',
    borderColor: 'border-[#2D5A3D]',
  },
  {
    name: 'Premium Gold',
    price: 99.99,
    period: '/month',
    description: 'Maximum visibility & features',
    icon: Crown,
    premium: true,
    features: [
      'Everything in Premium Silver',
      'Unlimited video listings (60 sec)',
      'Homepage featured placement',
      'Gold verified badge',
      'Custom brand page',
      'White-glove support',
      '30% platform fee discount',
      'Exclusive promotions',
      'API access',
    ],
    color: 'from-[#C4603A] to-[#B8941F]',
    borderColor: 'border-[#C4603A]',
  },
  {
    name: 'Premium Platinum',
    price: 199.99,
    period: '/month',
    description: 'Ultimate seller experience',
    icon: Sparkles,
    premium: true,
    features: [
      'Everything in Premium Gold',
      'Unlimited listings & videos',
      'Permanent homepage spotlight',
      'Platinum verified badge',
      'Dedicated marketing campaigns',
      'VIP concierge support',
      '50% platform fee discount',
      'Priority shipping partnerships',
      'Custom API integrations',
      'Quarterly business reviews',
    ],
    color: 'from-gray-700 to-gray-900',
    borderColor: 'border-gray-700',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white px-6 py-2 rounded-full mb-6">
            <Crown className="w-5 h-5" />
            <span className="text-sm">Choose Your Perfect Plan</span>
          </div>
          <h1 className="text-5xl text-gray-900 mb-4">Pricing Plans</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From casual sellers to fashion entrepreneurs, we have a plan that fits your needs
          </p>
        </div>

        {/* Free & Standard Plans */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl text-gray-900">Standard Plans</h2>
            <div className="text-sm text-gray-600">No credit card required for free plan</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.slice(0, 4).map((plan) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.name}
                  className={`relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all p-8 border-2 ${
                    plan.popular ? 'border-purple-400 scale-105' : 'border-gray-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm px-6 py-1 rounded-full">
                      Most Popular
                    </div>
                  )}

                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-2xl text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-sm text-gray-600 mb-6">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-4xl text-gray-900">${plan.price}</span>
                    {plan.period && <span className="text-gray-600">{plan.period}</span>}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button className={`w-full py-3 rounded-full transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                      : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}>
                    {plan.price === 0 ? 'Get Started' : 'Subscribe'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Premium Plans */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl text-gray-900">Premium Plans</h2>
            </div>
            <div className="text-sm text-[#2D5A3D]">Includes video listing features</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {pricingPlans.slice(4).map((plan, index) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.name}
                  className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl hover:shadow-2xl transition-all p-8 border-2 border-transparent hover:border-[#2D5A3D]"
                >
                  {index === 1 && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#C4603A] to-[#B8941F] text-white text-sm px-6 py-1 rounded-full">
                      Recommended
                    </div>
                  )}

                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-sm text-gray-600 mb-6">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-5xl bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] bg-clip-text text-transparent">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Check className="w-5 h-5 text-[#2D5A3D] flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button className="w-full bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white py-4 rounded-full hover:shadow-lg hover:scale-105 transition-all">
                    Upgrade to Premium
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ / Comparison */}
        <div className="mt-20 bg-white rounded-3xl shadow-xl p-12">
          <h2 className="text-3xl text-center text-gray-900 mb-12">Why Go Premium?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl text-gray-900 mb-2">Video Listings</h3>
              <p className="text-gray-600">
                Showcase your items with TikTok-style videos. Premium sellers see 3x higher engagement and faster sales.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl text-gray-900 mb-2">Featured Placement</h3>
              <p className="text-gray-600">
                Get priority placement in search results and featured sections. Be seen by thousands of daily shoppers.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl text-gray-900 mb-2">Exclusive Benefits</h3>
              <p className="text-gray-600">
                Premium badges, reduced fees, dedicated support, and early access to new features and promotions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
