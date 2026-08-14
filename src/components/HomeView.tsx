import React from 'react';
import { ArrowRight, ShieldCheck, Truck, Sparkles, HeartHandshake, Star, Award, Phone, MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { HeroSlider } from './HeroSlider';
import { ProductCard } from './ProductCard';
import { RakoMartLogoIcon } from './RakoMartLogo';

export const HomeView: React.FC = () => {
  const { products, categories, setSelectedCategory, navigateTo, settings } = useStore();

  const activeCategories = categories
    .filter((c) => c.isActive !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 8);
  const bestSellers = products.slice(0, 4);

  let rawPhone = settings.customerCarePhone || '8801410425948';
  let whatsappPhone = rawPhone.replace(/\D/g, '');
  if (whatsappPhone.startsWith('0')) {
    whatsappPhone = '88' + whatsappPhone;
  } else if (!whatsappPhone.startsWith('88') && whatsappPhone.length === 10) {
    whatsappPhone = '880' + whatsappPhone;
  }
  const whatsappUrl = `https://wa.me/${whatsappPhone}`;

  return (
    <div className="space-y-10 pb-8">
      {/* 1st Hero Carousel Banner Slider */}
      <HeroSlider position="hero1" />

      {/* 2nd Hero Carousel / Brand Value Banner Section */}
      <HeroSlider position="hero2" />

      {/* Categories Showcase Grid */}

      {/* Categories Showcase Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#281044]">
              Product Categories
            </h2>
            <p className="text-xs text-neutral-500">Explore your favorite beauty & lifestyle categories</p>
          </div>

          <button
            onClick={() => {
              setSelectedCategory(null);
              navigateTo('products');
            }}
            className="text-xs font-bold text-[#281044] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {activeCategories.map((cat) => (
            <div
              key={cat.id || cat.slug}
              onClick={() => {
                setSelectedCategory(cat.id || cat.slug);
                navigateTo('products');
              }}
              className="group bg-white rounded-2xl border border-neutral-200/80 p-3 text-center cursor-pointer hover:border-[#281044] hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center space-y-2 min-h-[110px]"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-purple-50 group-hover:scale-105 transition-transform duration-300 shadow-2xs border border-purple-100/50 flex items-center justify-center shrink-0">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80'}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xs font-bold text-neutral-800 group-hover:text-[#281044] transition-colors leading-tight px-1 text-center">
                {cat.name}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* Premium Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div>
            <span className="text-xs font-bold text-purple-900 uppercase tracking-wider block mb-0.5">
              RakoMart Featured Selection
            </span>
            <h2 className="text-lg sm:text-2xl font-extrabold text-[#281044]">
              Where Variety Meets Uncompromised Quality.
            </h2>
          </div>

          <button
            onClick={() => {
              setSelectedCategory(null);
              navigateTo('products');
            }}
            className="text-xs font-bold text-[#281044] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>All Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Customer Support WhatsApp Quick Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3 sm:p-4 flex items-center justify-center shadow-xs">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-sm rounded-xl shadow-xs transition-all duration-200 active:scale-95 text-center"
          >
            <Phone className="w-4 h-4 fill-current" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </section>

      {/* Bestsellers Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#281044]">
              Bestselling Products
            </h2>
            <p className="text-xs text-neutral-500">Customer favorite skincare and cosmetic essentials</p>
          </div>

          <button
            onClick={() => navigateTo('products')}
            className="text-xs font-bold text-[#281044] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Guarantee & Trust Badges Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="space-y-1.5 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-[#281044] flex items-center justify-center mb-1">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-neutral-900">100% Authentic Products</h4>
            <p className="text-xs text-neutral-500 max-w-xs">
              We never sell fake or replica products. 100% genuine cosmetics guarantee.
            </p>
          </div>

          <div className="space-y-1.5 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-[#281044] flex items-center justify-center mb-1">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-neutral-900">Fast Nationwide Delivery</h4>
            <p className="text-xs text-neutral-500 max-w-xs">
              Inside Dhaka in 24-48 hours and outside Dhaka in 2-3 days via trusted couriers with Cash on Delivery.
            </p>
          </div>

          <div className="space-y-1.5 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-[#281044] flex items-center justify-center mb-1">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-neutral-900">bKash & Nagad Payments</h4>
            <p className="text-xs text-neutral-500 max-w-xs">
              Secure digital payments via bKash and Nagad or pay Cash on Delivery after receiving your order.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
