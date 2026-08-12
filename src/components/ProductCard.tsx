import React from 'react';
import { ShoppingBag, Star, Zap, Play } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, navigateTo } = useStore();

  const handleCardClick = () => {
    navigateTo('product_details', { product });
  };

  const handleQuickOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    navigateTo('checkout');
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-xl border border-neutral-200/80 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer hover:border-purple-300"
    >
      {/* Product Image Box */}
      <div className="relative aspect-square w-full bg-neutral-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Discount Badge */}
        {product.discountBadge && (
          <span className="absolute top-2 left-2 bg-[#281044] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
            {product.discountBadge}
          </span>
        )}

        {/* Video Icon Badge */}
        {product.videoUrl && (
          <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
            <Play className="w-2.5 h-2.5 fill-current" />
            Video
          </span>
        )}

        {/* Stock Tag */}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute bottom-2 left-2 bg-amber-500 text-white text-[10px] font-medium px-2 py-0.5 rounded">
            Limited Stock ({product.stock} left)
          </span>
        )}
      </div>

      {/* Product Content Body */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1">
            <span className="font-semibold text-purple-900 uppercase tracking-wider">
              {product.brand || 'RakoMart'}
            </span>
            <div className="flex items-center text-amber-500 gap-0.5 font-bold">
              <Star className="w-3 h-3 fill-current" />
              <span>{product.rating}</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 line-clamp-2 leading-snug group-hover:text-[#281044] transition-colors mb-2">
            {product.title}
          </h3>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-neutral-100">
          <div className="flex items-baseline gap-1.5 mb-2.5">
            <span className="text-sm sm:text-base font-extrabold text-[#281044]">
              ৳{product.price.toLocaleString()}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-neutral-400 line-through">
                ৳{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Dual Action Buttons */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={handleAddToCart}
              className="py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-[#281044] rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
              title="Add to Cart"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#281044]" />
              <span className="hidden xs:inline">Add to Cart</span>
              <span className="xs:hidden">+ Cart</span>
            </button>

            <button
              onClick={handleQuickOrder}
              className="py-1.5 px-2 bg-[#281044] hover:bg-[#3b1763] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-2xs"
              title="Order Now"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-current" />
              <span>Order Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
