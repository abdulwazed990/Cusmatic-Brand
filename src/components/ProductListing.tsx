import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, Search, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CATEGORIES } from '../data/mockProducts';
import { ProductCard } from './ProductCard';

export const ProductListing: React.FC = () => {
  const { products, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery } = useStore();

  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'rating'>('featured');
  const [maxPrice, setMaxPrice] = useState<number>(3000);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category Filter
      if (selectedCategory && product.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = product.title.toLowerCase().includes(q);
        const matchTitleBn = product.titleBn?.toLowerCase().includes(q);
        const matchBrand = product.brand?.toLowerCase().includes(q);
        const matchCategory = product.category.toLowerCase().includes(q);
        if (!matchTitle && !matchTitleBn && !matchBrand && !matchCategory) {
          return false;
        }
      }

      // Max Price Filter
      if (product.price > maxPrice) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [products, selectedCategory, searchQuery, maxPrice, sortBy]);

  const activeCategoryObj = CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Category Banner or Search Header */}
      <div className="bg-gradient-to-r from-[#281044] via-[#3b1763] to-[#281044] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 bg-purple-500/30 border border-purple-300/30 text-purple-200 text-xs font-semibold px-3 py-1 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            RakoMart Cosmetics Collection
          </span>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            {activeCategoryObj ? `${activeCategoryObj.name} (${activeCategoryObj.nameBn})` : 'সকল কসমেটিকস প্রোডাক্ট'}
          </h1>
          <p className="text-xs sm:text-sm text-purple-200/90 mt-1.5 leading-relaxed">
            {activeCategoryObj
              ? `সেরা ব্র্যান্ডের অরিজিনাল ${activeCategoryObj.nameBn} সংগ্রহ দেখুন।`
              : 'আন্তর্জাতিক ব্র্যান্ডের ১০০% প্রামাণিক স্কিনকেয়ার, মেকআপ, লিপকেয়ার এবং পারফিউম ক্যাটাগরি।'}
          </p>
        </div>
      </div>

      {/* Category Filter Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all ${
            selectedCategory === null
              ? 'bg-[#281044] text-white shadow-xs'
              : 'bg-white border border-neutral-200 text-neutral-700 hover:border-purple-300'
          }`}
        >
          সব ক্যাটাগরি ({products.length})
        </button>

        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all ${
              selectedCategory === cat.id
                ? 'bg-[#281044] text-white shadow-xs'
                : 'bg-white border border-neutral-200 text-neutral-700 hover:border-purple-300'
            }`}
          >
            {cat.name} ({cat.nameBn})
          </button>
        ))}
      </div>

      {/* Filters and Controls Strip */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-neutral-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search status & Reset */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-neutral-700">
            মোট পাওয়া গেছে: <span className="text-[#281044] font-extrabold">{filteredProducts.length}</span> টি প্রোডাক্ট
          </span>

          {(selectedCategory || searchQuery || maxPrice < 3000) && (
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSearchQuery('');
                setMaxPrice(3000);
              }}
              className="text-xs text-red-600 font-semibold hover:underline"
            >
              ফিল্টার রিসেট করুন
            </button>
          )}
        </div>

        {/* Controls: Price Slider & Sorting */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Max Price Slider */}
          <div className="flex items-center gap-2 text-xs text-neutral-700 font-medium">
            <span>সর্বোচ্চ মূল্য:</span>
            <input
              type="range"
              min="500"
              max="3000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-24 sm:w-32 accent-[#281044] cursor-pointer"
            />
            <span className="font-bold text-[#281044]">৳{maxPrice}</span>
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2 text-xs text-neutral-700 font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500" />
            <span>সাজান:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-neutral-100 border border-neutral-200 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#281044]"
            >
              <option value="featured">জনপ্রিয় প্রোডাক্ট</option>
              <option value="price_low">দাম: কম থেকে বেশি</option>
              <option value="price_high">দাম: বেশি থেকে কম</option>
              <option value="rating">সেরা কাস্টমার রেটিং</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center my-6">
          <div className="w-16 h-16 rounded-full bg-purple-50 text-[#281044] mx-auto flex items-center justify-center mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-neutral-800 mb-1">কোনো প্রোডাক্ট পাওয়া যায়নি</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
            অন্য কোনো সার্চ কিওয়ার্ড অথবা ক্যাটাগরি ফিল্টার নির্বাচন করে চেষ্টা করুন।
          </p>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSearchQuery('');
              setMaxPrice(3000);
            }}
            className="bg-[#281044] text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-xs"
          >
            সব প্রোডাক্ট দেখুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
