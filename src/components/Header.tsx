import React, { useState } from 'react';
import { ShoppingBag, Search, Facebook, Menu, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { RakoMartLogo } from './RakoMartLogo';

export const Header: React.FC = () => {
  const {
    cartCount,
    setIsCartDrawerOpen,
    navigateTo,
    searchQuery,
    setSearchQuery,
    currentView,
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateTo('products');
    }
  };

  const facebookUrl = "https://www.facebook.com/share/1BhVJTWSjz/?mibextid=wwXIfr";

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-xs">
      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-4">
        {/* LEFT: Logo & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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
        <div className="hidden md:flex flex-1 max-w-md mx-2 lg:mx-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search beauty essentials... (e.g. Snail Essence, Sunscreen)"
              className="w-full pl-10 pr-24 py-2 bg-neutral-100/80 border border-neutral-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#281044]/30 focus:border-[#281044] transition-all"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#281044] hover:bg-[#3b1763] text-white text-xs px-3.5 py-1.5 rounded-full font-medium transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* RIGHT: Cart Drawer Trigger Button */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="relative p-2.5 bg-[#281044] text-white rounded-full hover:bg-[#3b1763] transition-transform active:scale-95 shadow-xs flex items-center justify-center shrink-0"
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
            Home
          </button>
          <button
            onClick={() => {
              navigateTo('products');
            }}
            className={`py-2.5 border-b-2 transition-colors ${
              currentView === 'products' ? 'border-[#281044] text-[#281044]' : 'border-transparent hover:text-[#281044]'
            }`}
          >
            All Cosmetics
          </button>
          <button
            onClick={() => navigateTo('order_tracking')}
            className={`py-2.5 border-b-2 transition-colors ${
              currentView === 'order_tracking' ? 'border-[#281044] text-[#281044]' : 'border-transparent hover:text-[#281044]'
            }`}
          >
            Order Tracking
          </button>
          <button
            onClick={() => navigateTo('support')}
            className={`py-2.5 border-b-2 transition-colors ${
              currentView === 'support' ? 'border-[#281044] text-[#281044]' : 'border-transparent hover:text-[#281044]'
            }`}
          >
            Customer Care & Support
          </button>
        </div>
      </nav>

      {/* Mobile Full Search Bar Section (Below Mobile Header, Above Main Cover / Video Section) */}
      <div className="md:hidden bg-neutral-50 border-t border-neutral-200/80 px-3.5 py-2.5">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md mx-auto">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search beauty essentials..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-300 rounded-full text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#281044]/30 focus:border-[#281044] transition-all"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <button
            type="submit"
            className="bg-[#281044] hover:bg-[#3b1763] active:scale-95 text-white text-xs px-4 py-2 rounded-full font-bold transition-all shrink-0 shadow-2xs"
          >
            Search
          </button>
        </form>
      </div>

      {/* Mobile Nav Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200 px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Select Menu</span>
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
              🏠 Home
            </button>
            <button
              onClick={() => {
                navigateTo('products');
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-purple-50 hover:text-[#281044]"
            >
              💄 All Cosmetics Products
            </button>
            <button
              onClick={() => {
                navigateTo('order_tracking');
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-purple-50 hover:text-[#281044]"
            >
              🚚 Track Your Order
            </button>
            <button
              onClick={() => {
                navigateTo('support');
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-purple-50 hover:text-[#281044]"
            >
              📞 Customer Care & Support
            </button>
          </div>

          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600">
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 font-medium py-1"
            >
              <Facebook className="w-4 h-4 fill-current" />
              Official Facebook Page
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
