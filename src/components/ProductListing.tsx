import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, Search, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';

export const ProductListing: React.FC = () => {
  const { products, categories, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery } = useStore();

  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'rating'>('featured');
  const [maxPrice, setMaxPrice] = useState<number>(3000);

  const activeCategories = useMemo(() => {
    return categories
      .filter((c) => c.isActive !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [categories]);

  const activeCategoryObj = useMemo(() => {
    if (!selectedCategory) return null;
    return activeCategories.find(
      (c) =>
        c.id.toLowerCase() === selectedCategory.toLowerCase() ||
        c.slug.toLowerCase() === selectedCategory.toLowerCase() ||
        c.name.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [activeCategories, selectedCategory]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category Filter
      if (selectedCategory) {
        const isOffersCategory =
          selectedCategory.toLowerCase() === 'offers-deals' ||
          selectedCategory.toLowerCase() === 'offers & deals';

        if (isOffersCategory) {
          const isOfferProduct =
            product.isOffer === true ||
            Boolean(product.discountBadge) ||
            (product.originalPrice && product.originalPrice > product.price) ||
            product.category.toLowerCase() === 'offers-deals';
          if (!isOfferProduct) return false;
        } else {
          const pCat = product.category.toLowerCase();
          const sCat = selectedCategory.toLowerCase();
          const matches =
            pCat === sCat ||
            pCat.replace(/[^a-z0-9]/g, '-') === sCat.replace(/[^a-z0-9]/g, '-') ||
            (activeCategoryObj && pCat === activeCategoryObj.id.toLowerCase()) ||
            (activeCategoryObj && pCat === activeCategoryObj.name.toLowerCase());
          if (!matches) return false;
        }
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
  }, [products, selectedCategory, searchQuery, maxPrice, sortBy, activeCategoryObj]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Category Banner or Search Header */}
      <div className="bg-gradient-to-r from-[#281044] via-[#3b1763] to-[#281044] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl flex items-center gap-4">
          {activeCategoryObj?.image && (
            <img
              src={activeCategoryObj.image}
              alt={activeCategoryObj.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-purple-300/40 shadow-sm shrink-0"
            />
          )}
          <div>
            <span className="inline-flex items-center gap-1.5 bg-purple-500/30 border border-purple-300/30 text-purple-200 text-xs font-semibold px-3 py-1 rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              RakoMart Category Collection
            </span>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              {activeCategoryObj ? activeCategoryObj.name : 'All Products'}
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/90 mt-1.5 leading-relaxed">
              {activeCategoryObj
                ? `Explore authentic products in ${activeCategoryObj.name}.`
                : 'Browse our complete catalog of authentic products from top international brands.'}
            </p>
          </div>
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
          All Products ({products.length})
        </button>

        {activeCategories.map((cat) => {
          const isSelected =
            selectedCategory?.toLowerCase() === cat.id.toLowerCase() ||
            selectedCategory?.toLowerCase() === cat.slug.toLowerCase() ||
            selectedCategory?.toLowerCase() === cat.name.toLowerCase();

          return (
            <button
              key={cat.id || cat.slug}
              onClick={() => setSelectedCategory(cat.id || cat.slug)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#281044] text-white shadow-xs'
                  : 'bg-white border border-neutral-200 text-neutral-700 hover:border-purple-300'
              }`}
            >
              {cat.image && (
                <img src={cat.image} alt={cat.name} className="w-4 h-4 rounded-full object-cover shrink-0" />
              )}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Filters and Controls Strip */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-neutral-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search status & Reset */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-neutral-700">
            Total items found: <span className="text-[#281044] font-extrabold">{filteredProducts.length}</span> products
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
              Reset Filters
            </button>
          )}
        </div>

        {/* Controls: Price Slider & Sorting */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Max Price Slider */}
          <div className="flex items-center gap-2 text-xs text-neutral-700 font-medium">
            <span>Max Price:</span>
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
            <span>Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-neutral-100 border border-neutral-200 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#281044]"
            >
              <option value="featured">Featured & Bestsellers</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Customer Rating</option>
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
          <h3 className="text-lg font-bold text-neutral-800 mb-1">No Products Found</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
            Try searching with a different keyword or resetting your category filters.
          </p>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSearchQuery('');
              setMaxPrice(3000);
            }}
            className="bg-[#281044] text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-xs"
          >
            View All Products
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
