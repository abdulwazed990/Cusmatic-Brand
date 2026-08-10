import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const HeroSlider: React.FC = () => {
  const { banners, navigateTo } = useStore();
  const activeBanners = banners
    .filter((b) => b.isActive)
    .sort((a, b) => a.order - b.order);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const currentBanner = activeBanners[currentIndex] || activeBanners[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 my-4 sm:my-6">
      <div className="relative h-[240px] sm:h-[360px] lg:h-[440px] w-full rounded-2xl overflow-hidden shadow-md bg-[#281044] border border-purple-900/30">
        {/* Banner Image with subtle fade */}
        <img
          src={currentBanner.image}
          alt={currentBanner.title}
          className="w-full h-full object-cover object-center transition-opacity duration-700 opacity-90"
          loading="eager"
        />

        {/* Gradient Overlay for crisp readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#281044]/95 via-[#281044]/60 to-transparent flex flex-col justify-center px-6 sm:px-12 lg:px-16 text-white max-w-2xl">
          <span className="inline-block bg-purple-500/30 border border-purple-300/30 text-purple-200 text-xs font-semibold px-3 py-1 rounded-full w-fit mb-3 backdrop-blur-xs">
            RakoMart Exclusive Selection
          </span>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white mb-2 font-sans">
            {currentBanner.title}
          </h2>
          <p className="text-xs sm:text-sm lg:text-base text-purple-100/90 leading-relaxed line-clamp-2 sm:line-clamp-3 mb-5 font-sans">
            {currentBanner.subtitle}
          </p>

          <div>
            <button
              onClick={() => navigateTo('products')}
              className="inline-flex items-center gap-2 bg-white text-[#281044] hover:bg-purple-50 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-md transition-all transform hover:scale-[1.03] active:scale-[0.97]"
            >
              <span>{currentBanner.buttonText || 'কেনাকাটা শুরু করুন'}</span>
              <ArrowRight className="w-4 h-4 text-[#281044]" />
            </button>
          </div>
        </div>

        {/* Carousel Navigation Controls */}
        {activeBanners.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-xs transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-xs transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
              {activeBanners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
