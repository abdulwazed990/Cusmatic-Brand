import React, { useState } from 'react';
import { ShoppingBag, Search, Facebook, Phone, Truck, Menu, X, ShieldCheck, HeartHandshake } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { RakoMartLogo } from './RakoMartLogo';

export const Header: React.FC = () => {
  const {
    cartCount,
    setIsCartDrawerOpen,
    navigateTo,
    searchQuery,
    setSearchQuery,
    settings,
    currentView,
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateTo('products');
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-[#281044] text-purple-100 text-xs py-1.5 px-4 font-medium flex items-center justify-between border-b border-purple-900/50">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2 overflow-hidden">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="truncate">{settings.siteNotice || '১০০% অরিজিনাল কসমেটিকস গ্যারান্টি | দ্রুত ক্যাশ অন ডেলিভারি'}</span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-[11px] text-purple-200 shrink-0">
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-purple-300" />
              ঢাকার ভেতরে ৳{settings.deliveryInsideDhaka} | বাইরে ৳{settings.deliveryOutsideDhaka}
            </span>
            <a
              href={`https://wa.me/${settings.customerCarePhone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              হেল্পলাইন: {settings.customerCarePhone}
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-4">
        {/* LEFT: Logo & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-neutral-700 hover:text-[#281044] hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <RakoMartLogo onClick={() => navigateTo('home')} size="md" />
        </div>

        {/* CENTER: Desktop Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="পছন্দের কসমেটিকস বা প্রোডাক্ট খুঁজুন... (e.g. Snail Essence, Sunscreen)"
              className="w-full pl-10 pr-24 py-2 bg-neutral-100/80 border border-neutral-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#281044]/30 focus:border-[#281044] transition-all"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#281044] hover:bg-[#3b1763] text-white text-xs px-3.5 py-1.5 rounded-full font-medium transition-colors"
            >
              খুঁজুন
            </button>
          </form>
        </div>

        {/* RIGHT: Actions (Tracking, Support, Cart, Facebook link) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Toggle for Mobile */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="md:hidden p-2 text-neutral-700 hover:text-[#281044] hover:bg-neutral-100 rounded-lg transition-colors"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Order Tracking */}
          <button
            onClick={() => navigateTo('order_tracking')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
              currentView === 'order_tracking'
                ? 'bg-purple-50 text-[#281044] border-[#281044]'
                : 'border-neutral-200 text-neutral-700 hover:border-purple-300 hover:text-[#281044]'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-[#281044]" />
            অর্ডার ট্র্যাক
          </button>

          {/* Customer Care / Support Link */}
          <button
            onClick={() => navigateTo('support')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-[#281044] transition-colors"
          >
            <HeartHandshake className="w-4 h-4 text-purple-700" />
            সাপোর্ট
          </button>

          {/* Facebook Official Page Link */}
          <a
            href="https://www.facebook.com/share/198QLN5TSt/?mibextid=wwXIfr"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-all hover:scale-105 border border-blue-200"
            title="RakoMart Official Facebook Page"
            aria-label="Facebook Page"
          >
            <Facebook className="w-5 h-5 fill-current" />
          </a>

          {/* Cart Drawer Trigger */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="relative p-2.5 bg-[#281044] text-white rounded-full hover:bg-[#3b1763] transition-transform active:scale-95 shadow-xs flex items-center justify-center"
            title="Shopping Cart"
            aria-label="Open Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Bar (Desktop) */}
      <nav className="hidden md:block bg-neutral-50 border-t border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-6 flex items-center space-x-8 text-xs font-semibold text-neutral-700">
          <button
            onClick={() => navigateTo('home')}
            className={`py-2.5 border-b-2 transition-colors ${
              currentView === 'home' ? 'border-[#281044] text-[#281044]' : 'border-transparent hover:text-[#281044]'
            }`}
          >
            হোমপেজ (Home)
          </button>
          <button
            onClick={() => {
              navigateTo('products');
            }}
            className={`py-2.5 border-b-2 transition-colors ${
              currentView === 'products' ? 'border-[#281044] text-[#281044]' : 'border-transparent hover:text-[#281044]'
            }`}
          >
            সকল প্রোডাক্ট (All Cosmetics)
          </button>
          <button
            onClick={() => navigateTo('order_tracking')}
            className={`py-2.5 border-b-2 transition-colors ${
              currentView === 'order_tracking' ? 'border-[#281044] text-[#281044]' : 'border-transparent hover:text-[#281044]'
            }`}
          >
            অর্ডার ট্র্যাকিং
          </button>
          <button
            onClick={() => navigateTo('support')}
            className={`py-2.5 border-b-2 transition-colors ${
              currentView === 'support' ? 'border-[#281044] text-[#281044]' : 'border-transparent hover:text-[#281044]'
            }`}
          >
            কাস্টমার কেয়ার & সাপোর্ট
          </button>

          <div className="ml-auto flex items-center gap-2 text-emerald-700 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>১০০% অরিজিনাল কসমেটিকসের নিশ্চয়তা</span>
          </div>
        </div>
      </nav>

      {/* Mobile Search Expand Bar */}
      {isSearchOpen && (
        <div className="md:hidden bg-neutral-50 p-3 border-t border-neutral-200 animate-fadeIn">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="পণ্য খুঁজুন (e.g. Lip Tint, Serum)..."
              className="w-full pl-9 pr-20 py-2 bg-white border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#281044]"
              autoFocus
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#281044] text-white text-xs px-3 py-1.5 rounded-md font-medium"
            >
              খুঁজুন
            </button>
          </form>
        </div>
      )}

      {/* Mobile Nav Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200 px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">মেনু নির্বাচন করুন</span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-neutral-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col space-y-1">
            <button
              onClick={() => {
                navigateTo('home');
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-purple-50 hover:text-[#281044]"
            >
              🏠 হোমপেজ
            </button>
            <button
              onClick={() => {
                navigateTo('products');
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-purple-50 hover:text-[#281044]"
            >
              💄 সকল কসমেটিকস প্রোডাক্ট
            </button>
            <button
              onClick={() => {
                navigateTo('order_tracking');
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-purple-50 hover:text-[#281044]"
            >
              🚚 মোবাইল দিয়ে অর্ডার ট্র্যাক করুন
            </button>
            <button
              onClick={() => {
                navigateTo('support');
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-purple-50 hover:text-[#281044]"
            >
              📞 কাস্টমার কেয়ার হেল্পলাইন
            </button>
          </div>

          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600">
            <a
              href="https://www.facebook.com/share/198QLN5TSt/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 font-medium py-1"
            >
              <Facebook className="w-4 h-4 fill-current" />
              অফিসিয়াল ফেইসবুক পেজ
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
