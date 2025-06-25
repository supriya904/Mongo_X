import { type FC } from 'react';
import { Check, Star, Shield, Zap, Award, Sparkles } from 'lucide-react';

export const PremiumPage: FC = () => {
  const features = [
    {
      icon: Check,
      title: 'Blue Checkmark',
      description: 'Get verified and stand out from the crowd with a blue checkmark next to your name.'
    },
    {
      icon: Shield,
      title: 'Enhanced Security',
      description: 'Additional account protection with two-factor authentication and enhanced monitoring.'
    },
    {
      icon: Zap,
      title: 'Priority Tweets',
      description: 'Your tweets will be prioritized in conversations and search results.'
    },
    {
      icon: Award,
      title: 'Ad-Free Experience',
      description: 'Enjoy an ad-free timeline for a cleaner, more focused experience.'
    },
    {
      icon: Sparkles,
      title: 'Exclusive Features',
      description: 'Early access to new features before they roll out to everyone else.'
    }
  ];

  const plans = [
    {
      name: 'Monthly',
      price: '$8',
      period: 'per month',
      features: ['All premium features', 'Cancel anytime', 'Priority support'],
      popular: false
    },
    {
      name: 'Annual',
      price: '$84',
      period: 'per year',
      features: ['All premium features', '30% savings vs monthly', 'Priority support', 'Extended tweet length'],
      popular: true
    }
  ];

  return (
    <div className="min-h-screen border-l border-r border-gray-200">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold">Premium</h1>
        </div>
      </header>

      {/* Hero section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8">
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Twitter Premium</h2>
        </div>
        <p className="text-lg mb-6">Unlock the full potential of your Twitter experience</p>
        <button className="bg-white text-blue-600 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition">
          Subscribe Now
        </button>
      </div>

      {/* Features section */}
      <div className="p-6">
        <h3 className="text-xl font-bold mb-6">Premium Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-3">
                <feature.icon className="h-6 w-6 text-blue-500" />
                <h4 className="font-bold">{feature.title}</h4>
              </div>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing section */}
      <div className="bg-gray-50 p-6">
        <h3 className="text-xl font-bold mb-6">Choose Your Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`bg-white border ${plan.popular ? 'border-blue-500' : 'border-gray-200'} rounded-xl p-6 relative hover:shadow-lg transition`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                  Best Value
                </div>
              )}
              <h4 className="text-xl font-bold mb-2">{plan.name}</h4>
              <div className="flex items-end gap-1 mb-4">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-gray-500">{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button 
                className={`w-full py-3 rounded-full font-bold ${plan.popular ? 'bg-blue-500 text-white hover:bg-blue-600' : 'border border-blue-500 text-blue-500 hover:bg-blue-50'} transition`}
              >
                Subscribe
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials section */}
      <div className="p-6 border-t border-gray-200">
        <h3 className="text-xl font-bold mb-6">What Premium Users Say</h3>
        <div className="bg-gray-50 p-4 rounded-xl italic text-gray-600">
          <p className="mb-4">"Twitter Premium has completely transformed how I use the platform. The ad-free experience alone is worth the subscription!"</p>
          <div className="font-bold">- Sarah Johnson, Premium User</div>
        </div>
      </div>

      {/* FAQ section */}
      <div className="p-6 border-t border-gray-200">
        <h3 className="text-xl font-bold mb-6">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-4">
            <h4 className="font-bold mb-2">How do I cancel my subscription?</h4>
            <p className="text-gray-600">You can cancel your Premium subscription at any time from your account settings. Your benefits will continue until the end of your billing period.</p>
          </div>
          <div className="border-b border-gray-200 pb-4">
            <h4 className="font-bold mb-2">Can I switch between plans?</h4>
            <p className="text-gray-600">Yes, you can switch between monthly and annual plans at any time. Changes will take effect at your next billing cycle.</p>
          </div>
          <div className="border-b border-gray-200 pb-4">
            <h4 className="font-bold mb-2">Is there a free trial?</h4>
            <p className="text-gray-600">We occasionally offer free trial periods for new subscribers. Check back regularly for promotional offers.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
