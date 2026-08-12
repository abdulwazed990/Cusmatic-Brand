import React, { useState } from 'react';
import { ShoppingBag, Zap, ShieldCheck, Truck, Star, ArrowLeft, Play, HeartHandshake, Phone } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ProductDetails: React.FC = () => {
  const { selectedProduct, addToCart, navigateTo, settings } = useStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);

  if (!selectedProduct) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h3 className="text-lg font-bold text-neutral-800 mb-2">Product Not Found</h3>
        <button
          onClick={() => navigateTo('products')}
          className="bg-[#281044] text-white text-xs font-bold px-6 py-2.5 rounded-full"
        >
          View All Products
        </button>
      </div>
    );
  }

  const activeImg = selectedImage || selectedProduct.image;
  const gallery = selectedProduct.galleryImages || [selectedProduct.image];

  const handleAddToCart = () => {
    addToCart(selectedProduct, quantity);
  };

  const handleBuyNow = () => {
    addToCart(selectedProduct, quantity);
    navigateTo('checkout');
  };

  const whatsappPhone = settings.customerCarePhone.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
    `Hello RakoMart, I would like to inquire about / order this product: ${selectedProduct.title} (ID: ${selectedProduct.id})`
  )}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Back to Products Navigation */}
      <div>
        <button
          onClick={() => navigateTo('products')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-[#281044] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Products</span>
        </button>
      </div>

      {/* Main Product Details Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Product Image Gallery & Video Player */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
            <img
              src={activeImg}
              alt={selectedProduct.title}
              className="w-full h-full object-cover object-center"
            />

            {selectedProduct.discountBadge && (
              <span className="absolute top-3 left-3 bg-[#281044] text-white text-xs font-bold px-3 py-1 rounded-md shadow-xs">
                {selectedProduct.discountBadge}
              </span>
            )}

            {selectedProduct.videoUrl && (
              <button
                onClick={() => setShowVideoModal(true)}
                className="absolute bottom-3 right-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-2 rounded-full shadow-md flex items-center gap-2 transition-transform hover:scale-105"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Watch Video Review</span>
              </button>
            )}
          </div>

          {/* Gallery Thumbnails */}
          {gallery.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {gallery.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                    activeImg === imgUrl ? 'border-[#281044] ring-1 ring-[#281044]' : 'border-neutral-200 hover:border-purple-300'
                  }`}
                >
                  <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Actions */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Brand & Stock Header */}
            <div className="flex items-center justify-between text-xs">
              <span className="bg-purple-100 text-[#281044] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                {selectedProduct.brand || 'RakoMart'}
              </span>

              {selectedProduct.stock > 0 ? (
                <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                  ✓ In Stock ({selectedProduct.stock} left)
                </span>
              ) : (
                <span className="text-red-600 font-bold bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-md">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Titles */}
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 leading-snug">
                {selectedProduct.title}
              </h1>
            </div>

            {/* Rating & Volume */}
            <div className="flex items-center gap-4 text-xs text-neutral-600 pt-1 border-t border-neutral-100">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-current" />
                <span>{selectedProduct.rating}</span>
                <span className="text-neutral-400 font-normal">({selectedProduct.reviewsCount} reviews)</span>
              </div>
              {selectedProduct.volume && (
                <span className="bg-neutral-100 font-medium px-2.5 py-0.5 rounded text-neutral-700">
                  Volume / Size: {selectedProduct.volume}
                </span>
              )}
            </div>

            {/* Pricing Section */}
            <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-100 flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#281044]">
                ৳{selectedProduct.price.toLocaleString()}
              </span>
              {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                <span className="text-sm text-neutral-400 line-through">
                  ৳{selectedProduct.originalPrice.toLocaleString()}
                </span>
              )}
              {selectedProduct.discountBadge && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  {selectedProduct.discountBadge}
                </span>
              )}
            </div>

            {/* Brief Description */}
            <div className="space-y-2 text-xs sm:text-sm text-neutral-700 leading-relaxed">
              <p>{selectedProduct.description}</p>
            </div>

            {/* Key Specifications / Origin */}
            {selectedProduct.details && (
              <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 text-xs space-y-1.5">
                {selectedProduct.details.skinType && (
                  <div>
                    <span className="font-bold text-neutral-800">Suitable Skin Type:</span>{' '}
                    <span className="text-neutral-600">{selectedProduct.details.skinType}</span>
                  </div>
                )}
                {selectedProduct.details.origin && (
                  <div>
                    <span className="font-bold text-neutral-800">Country of Origin:</span>{' '}
                    <span className="text-neutral-600">{selectedProduct.details.origin}</span>
                  </div>
                )}
                {selectedProduct.details.keyIngredients && selectedProduct.details.keyIngredients.length > 0 && (
                  <div>
                    <span className="font-bold text-neutral-800">Key Ingredients:</span>{' '}
                    <span className="text-neutral-600">
                      {selectedProduct.details.keyIngredients.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quantity Selector & Purchase Actions */}
          <div className="space-y-3 pt-4 border-t border-neutral-200">
            {/* Quantity Row */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-neutral-800">Quantity:</span>
              <div className="inline-flex items-center border border-neutral-300 rounded-lg bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1 text-sm font-bold text-neutral-700 hover:bg-neutral-100"
                >
                  -
                </button>
                <span className="px-3 text-xs font-extrabold text-neutral-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-1 text-sm font-bold text-neutral-700 hover:bg-neutral-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                className="py-3 px-4 bg-purple-100 hover:bg-purple-200 text-[#281044] font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-[#281044]" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="py-3 px-4 bg-[#281044] hover:bg-[#3b1763] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md"
              >
                <Zap className="w-4 h-4 text-amber-300 fill-current" />
                <span>Order Now</span>
              </button>
            </div>

            {/* Customer Care WhatsApp Order Action (VERY IMPORTANT REQUIREMENT) */}
            <div className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-2xs"
              >
                <Phone className="w-4 h-4 text-emerald-600 fill-current" />
                <span>Need Help Placing Order? Talk to Customer Care</span>
              </a>
            </div>

            {/* Guarantee Trust Badges */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-600 pt-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Genuine Cosmetics</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-purple-700 shrink-0" />
                <span>Nationwide Home Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Video Modal */}
      {showVideoModal && selectedProduct.videoUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-bold text-sm text-neutral-800">
                {selectedProduct.title} — Video Review
              </h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="p-1 text-neutral-500 hover:text-neutral-800"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
              <iframe
                src={selectedProduct.videoUrl}
                title="Product Review"
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
