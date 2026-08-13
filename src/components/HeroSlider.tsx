import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { RakoMartLogoIcon } from './RakoMartLogo';

interface HeroSliderProps {
  position?: 'hero1' | 'hero2';
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ position = 'hero1' }) => {
  const { banners, navigateTo, settings } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoError, setVideoError] = useState(false);

  const activeBanners = (banners || [])
    .filter((b) => b.isActive && (b.position || 'hero1') === position)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Reset video error on banner index change
  useEffect(() => {
    setVideoError(false);
  }, [currentIndex, position]);

  useEffect(() => {
    if (activeBanners.length <= 1 || !isPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeBanners.length, isPlaying]);

  if (activeBanners.length === 0) {
    if (position === 'hero2') {
      return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl p-6 sm:p-10 lg:p-12 border border-neutral-200/80 shadow-xs flex flex-col space-y-8 overflow-hidden">
            {/* Header Typography & Brand Logo */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
              {/* Left Side: Handwritten Bold Statement Typography */}
              <div 
                className="w-full md:w-3/5 text-[#281044] uppercase leading-[0.95] text-4xl sm:text-6xl md:text-6xl lg:text-7xl font-bold select-none tracking-normal"
                style={{ fontFamily: "'Mali', 'Sniglet', 'Fredoka', cursive" }}
              >
                <div className="block">CHOOSE</div>
                <div className="block">BETTER,</div>
                <div className="block">CHOOSE</div>
                <div className="block">RAKOMART</div>
              </div>

              {/* Right Side: Logo & Value Pillars */}
              <div className="w-full md:w-2/5 flex flex-col items-center md:items-end text-center md:text-right space-y-6 shrink-0">
                <div className="flex flex-col items-center md:items-end">
                  <RakoMartLogoIcon className="w-16 h-16 sm:w-20 sm:h-20 text-[#281044]" />
                  <span 
                    className="text-xs sm:text-sm font-bold text-[#281044] tracking-tight mt-1"
                    style={{ fontFamily: "'Mali', 'Sniglet', cursive" }}
                  >
                    RakoMart
                  </span>
                </div>

                {/* Show Pillars only when no custom media is uploaded */}
                {!settings?.brandStatementVideoUrl && !settings?.brandStatementImageUrl && (
                  <div className="space-y-6 text-[#281044] tracking-wider text-xs sm:text-sm md:text-base uppercase font-sans font-medium">
                    <div>
                      <p className="leading-tight font-medium text-[#2d124d]">DELIVERING AUTHENTIC</p>
                      <p className="leading-tight font-medium text-[#2d124d]">PRODUCTS</p>
                    </div>
                    <div>
                      <p className="leading-tight font-medium text-[#2d124d]">SUPERIOR QUALITY</p>
                    </div>
                    <div>
                      <p className="leading-tight font-medium text-[#2d124d]">SEAMLESS SHOPPING</p>
                      <p className="leading-tight font-medium text-[#2d124d]">EXPERIENCE</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Embedded Admin-Uploaded Video and/or Image Showcase */}
            {(settings?.brandStatementVideoUrl || settings?.brandStatementImageUrl) && (
              <div className="space-y-4 pt-4 border-t border-purple-100">
                {/* Uploaded Video */}
                {settings?.brandStatementVideoUrl && (
                  <div className="relative rounded-2xl overflow-hidden bg-[#281044] shadow-md border border-purple-900/40">
                    <video
                      src={settings.brandStatementVideoUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      disablePictureInPicture
                      controlsList="nodownload nofullscreen noremoteplayback"
                      onContextMenu={(e) => e.preventDefault()}
                      className="w-full max-h-[500px] object-cover pointer-events-none select-none"
                    />
                    {(settings.brandStatementText || settings.brandStatementSubtext) && (
                      <div className="p-4 bg-[#281044] text-white">
                        {settings.brandStatementText && (
                          <h3 className="text-base sm:text-lg font-bold">{settings.brandStatementText}</h3>
                        )}
                        {settings.brandStatementSubtext && (
                          <p className="text-xs text-purple-200 mt-0.5">{settings.brandStatementSubtext}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Uploaded Image */}
                {settings?.brandStatementImageUrl && (
                  <div className="relative rounded-2xl overflow-hidden bg-neutral-100 shadow-md border border-neutral-200">
                    <img
                      src={settings.brandStatementImageUrl}
                      alt="RakoMart Brand Showcase"
                      className="w-full max-h-[500px] object-cover"
                    />
                    {(settings.brandStatementText || settings.brandStatementSubtext) && (
                      <div className="p-4 bg-[#281044] text-white">
                        {settings.brandStatementText && (
                          <h3 className="text-base sm:text-lg font-bold">{settings.brandStatementText}</h3>
                        )}
                        {settings.brandStatementSubtext && (
                          <p className="text-xs text-purple-200 mt-0.5">{settings.brandStatementSubtext}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      );
    }

    return (
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 my-4 sm:my-6">
        <div 
          onClick={() => navigateTo('products')}
          className="relative h-[260px] sm:h-[380px] lg:h-[480px] w-full rounded-2xl overflow-hidden shadow-lg bg-[#281044] border border-purple-900/40 cursor-pointer group flex flex-col justify-between p-6 sm:p-10 lg:p-12 select-none"
        >
          <div className="absolute inset-0 bg-radial from-purple-800/20 via-transparent to-transparent opacity-60 pointer-events-none" />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div 
              className="text-white text-center leading-[0.88] uppercase font-bold tracking-normal animate-pulse duration-[3000ms]"
              style={{ 
                fontFamily: "'Mali', 'Sniglet', 'Fredoka', cursive",
                fontSize: "clamp(3.5rem, 12vw, 9.5rem)"
              }}
            >
              <div className="block drop-shadow-md">RAKO</div>
              <div className="block drop-shadow-md">MART</div>
            </div>
          </div>

          <div className="relative z-10 flex items-end justify-between w-full mt-auto pt-8">
            <div className="text-white/90 text-[10px] sm:text-xs md:text-sm font-semibold tracking-wider uppercase leading-tight font-sans">
              <div>CHOOSE BETTER</div>
              <div>CHOOSE RAKOMART</div>
            </div>

            <div className="text-white/90 text-[10px] sm:text-xs md:text-sm font-semibold tracking-wider uppercase leading-tight text-right font-sans">
              <div>UNCOMPROMISED</div>
              <div>QUALITY,</div>
              <div>EVERYDAY</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentBanner = activeBanners[currentIndex] || activeBanners[0];
  const isVideo = currentBanner.mediaType === 'video' || (currentBanner.videoUrl && currentBanner.videoUrl.trim().length > 0);
  const mediaSrc = isVideo ? (currentBanner.videoUrl || currentBanner.image) : currentBanner.image;

  return (
    <div className={`relative w-full max-w-7xl mx-auto px-4 sm:px-6 ${position === 'hero2' ? 'my-2' : 'my-4 sm:my-6'}`}>
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-lg bg-[#281044] border border-purple-800/30 group select-none">
        {/* Background Media (Image or Clean Presentation Video) */}
        {isVideo && !videoError ? (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden bg-[#281044]">
            {/* Ambient background blur for seamless widescreen presentation */}
            <video
              src={mediaSrc}
              autoPlay
              loop
              muted
              playsInline
              aria-hidden="true"
              tabIndex={-1}
              style={{ backgroundColor: 'transparent' }}
              className="absolute inset-0 w-full h-full object-cover filter blur-2xl opacity-90 scale-110 pointer-events-none select-none block m-0 p-0 border-0 outline-none"
            />
            {/* Primary Hero Video - 100% Uncropped Composition without top/bottom black lines */}
            <video
              key={mediaSrc}
              src={mediaSrc}
              autoPlay
              loop
              muted
              playsInline
              disablePictureInPicture
              controlsList="nodownload nofullscreen noremoteplayback"
              onContextMenu={(e) => e.preventDefault()}
              onError={() => setVideoError(true)}
              style={{ backgroundColor: 'transparent' }}
              className="relative z-10 w-full h-full object-contain object-center block m-0 p-0 border-0 outline-none pointer-events-none select-none transform scale-[1.008]"
            />
          </div>
        ) : (
          <img
            src={currentBanner.image || mediaSrc}
            alt={currentBanner.title || 'RakoMart Banner'}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
          />
        )}

        {/* Text Content Overlay */}
        <div className="relative z-10 h-full flex flex-col justify-between p-6 sm:p-10 lg:p-12 text-white pointer-events-none">
          <div className="max-w-xl space-y-2 sm:space-y-3 pointer-events-auto">
            {(currentBanner.title || currentBanner.subtitle) && (
              <span className="inline-block px-3 py-1 bg-purple-600/90 backdrop-blur-md text-white text-[10px] sm:text-xs font-extrabold uppercase rounded-full tracking-wider shadow-sm">
                {position === 'hero2' ? 'RakoMart Featured Showcase' : 'Official RakoMart Feature'}
              </span>
            )}
            {currentBanner.title && (
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                {currentBanner.title}
              </h2>
            )}
            {currentBanner.subtitle && (
              <p className="text-xs sm:text-sm lg:text-base text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] font-semibold line-clamp-2 max-w-lg">
                {currentBanner.subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 pointer-events-auto w-full">
            {/* Pagination / Controls */}
            {activeBanners.length > 1 && (
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1 hover:text-purple-300 text-white transition-colors"
                  title={isPlaying ? "Pause Slideshow" : "Play Slideshow"}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <div className="flex items-center gap-1">
                  {activeBanners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Previous / Next Arrows */}
        {activeBanners.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % activeBanners.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

