import React, { useState, useEffect, useRef } from 'react';
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
  const [desktopVideoError, setDesktopVideoError] = useState(false);
  const [mobileVideoError, setMobileVideoError] = useState(false);
  const [aspectRatios, setAspectRatios] = useState<Record<string, number>>({});

  const desktopVideoRef = useRef<HTMLVideoElement | null>(null);
  const mobileVideoRef = useRef<HTMLVideoElement | null>(null);
  const hero2DesktopVideoRef = useRef<HTMLVideoElement | null>(null);
  const hero2MobileVideoRef = useRef<HTMLVideoElement | null>(null);

  const activeBanners = (banners || [])
    .filter((b) => b.isActive && (b.position || 'hero1') === position)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Reset video errors on banner index or position change
  useEffect(() => {
    setDesktopVideoError(false);
    setMobileVideoError(false);
  }, [currentIndex, position]);

  // Slideshow interval
  useEffect(() => {
    if (activeBanners.length <= 1 || !isPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeBanners.length, isPlaying]);

  const currentBanner = activeBanners[currentIndex] || activeBanners[0];

  // Desktop Media calculation
  const isDesktopVideo = Boolean(
    currentBanner &&
    (currentBanner.mediaType === 'video' || (currentBanner.videoUrl && currentBanner.videoUrl.trim().length > 0))
  );
  const desktopMediaSrc = currentBanner
    ? isDesktopVideo
      ? (currentBanner.videoUrl || currentBanner.image)
      : currentBanner.image
    : '';

  // Mobile Media calculation (falls back to desktop if not separately uploaded)
  const isMobileVideo = Boolean(
    currentBanner &&
    (currentBanner.mobileMediaType === 'video' || (currentBanner.mobileVideoUrl && currentBanner.mobileVideoUrl.trim().length > 0) || (!currentBanner.mobileImage && isDesktopVideo))
  );
  const mobileMediaSrc = currentBanner
    ? isMobileVideo
      ? (currentBanner.mobileVideoUrl || currentBanner.mobileImage || desktopMediaSrc)
      : (currentBanner.mobileImage || currentBanner.image || desktopMediaSrc)
    : '';

  // Pre-calculate image aspect ratio when media changes
  useEffect(() => {
    [desktopMediaSrc, mobileMediaSrc].forEach((src) => {
      if (!src || src.endsWith('.mp4') || src.endsWith('.webm')) return;
      const img = new Image();
      img.src = src;
      img.onload = () => {
        if (img.naturalWidth && img.naturalHeight) {
          const ratio = img.naturalWidth / img.naturalHeight;
          setAspectRatios((prev) => (prev[src] === ratio ? prev : { ...prev, [src]: ratio }));
        }
      };
    });
  }, [desktopMediaSrc, mobileMediaSrc]);

  // Helper for resilient video playback
  const attachVideoAutoplay = (video: HTMLVideoElement | null) => {
    if (!video) return () => {};

    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('x5-playsinline', '');

    const tryPlay = () => {
      if (video) {
        video.muted = true;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            const onUserAction = () => {
              if (video) {
                video.muted = true;
                video.play().catch(() => {});
              }
              window.removeEventListener('touchstart', onUserAction);
              window.removeEventListener('touchend', onUserAction);
              window.removeEventListener('click', onUserAction);
              window.removeEventListener('scroll', onUserAction);
            };
            window.addEventListener('touchstart', onUserAction, { passive: true, once: true });
            window.addEventListener('touchend', onUserAction, { passive: true, once: true });
            window.addEventListener('click', onUserAction, { passive: true, once: true });
            window.addEventListener('scroll', onUserAction, { passive: true, once: true });
          });
        }
      }
    };

    tryPlay();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        tryPlay();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  };

  // Immediate callback ref handlers to force autoplay without waiting for effects
  const setDesktopVideoNode = (el: HTMLVideoElement | null) => {
    desktopVideoRef.current = el;
    if (el) {
      el.defaultMuted = true;
      el.muted = true;
      el.playsInline = true;
      el.setAttribute('playsinline', '');
      el.setAttribute('webkit-playsinline', '');
      el.setAttribute('x5-playsinline', '');
      el.play().catch(() => {});
    }
  };

  const setMobileVideoNode = (el: HTMLVideoElement | null) => {
    mobileVideoRef.current = el;
    if (el) {
      el.defaultMuted = true;
      el.muted = true;
      el.playsInline = true;
      el.setAttribute('playsinline', '');
      el.setAttribute('webkit-playsinline', '');
      el.setAttribute('x5-playsinline', '');
      el.play().catch(() => {});
    }
  };

  // Video autoplay listeners
  useEffect(() => {
    if (isDesktopVideo && desktopVideoRef.current) {
      return attachVideoAutoplay(desktopVideoRef.current);
    }
  }, [desktopMediaSrc, currentIndex, isDesktopVideo]);

  useEffect(() => {
    if (isMobileVideo && mobileVideoRef.current) {
      return attachVideoAutoplay(mobileVideoRef.current);
    }
  }, [mobileMediaSrc, currentIndex, isMobileVideo]);

  useEffect(() => {
    if (settings?.brandStatementVideoUrl) {
      const clean1 = attachVideoAutoplay(hero2DesktopVideoRef.current);
      const clean2 = attachVideoAutoplay(hero2MobileVideoRef.current);
      return () => {
        clean1();
        clean2();
      };
    }
  }, [settings?.brandStatementVideoUrl]);

  const handleMediaLoad = (src: string, width: number, height: number) => {
    if (width && height && src) {
      const ratio = width / height;
      setAspectRatios((prev) => (prev[src] === ratio ? prev : { ...prev, [src]: ratio }));
    }
  };

  // Handle banner link click
  const handleBannerClick = () => {
    if (currentBanner?.link) {
      if (currentBanner.link.startsWith('http://') || currentBanner.link.startsWith('https://')) {
        window.open(currentBanner.link, '_blank');
      } else {
        navigateTo('products');
      }
    }
  };

  // -------------------------------------------------------------------------------------------------
  // EMPTY STATE FALLBACK (When no custom active banners are configured)
  // -------------------------------------------------------------------------------------------------
  if (activeBanners.length === 0) {
    if (position === 'hero2') {
      return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl p-6 sm:p-10 lg:p-12 border border-neutral-200/80 shadow-xs flex flex-col space-y-8 overflow-hidden">
            {/* Header Typography & Brand Logo */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
              {/* Left Side: Statement Typography */}
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
                {settings?.brandStatementVideoUrl && (
                  <div className="relative rounded-2xl overflow-hidden bg-[#281044] shadow-md border border-purple-900/40 flex items-center justify-center">
                    <video
                      ref={hero2DesktopVideoRef}
                      src={settings.brandStatementVideoUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                      disablePictureInPicture
                      controlsList="nodownload nofullscreen noremoteplayback"
                      onContextMenu={(e) => e.preventDefault()}
                      onEnded={(e) => {
                        e.currentTarget.currentTime = 0;
                        e.currentTarget.play().catch(() => {});
                      }}
                      onPause={(e) => {
                        e.currentTarget.play().catch(() => {});
                      }}
                      onLoadedData={(e) => {
                        e.currentTarget.muted = true;
                        e.currentTarget.play().catch(() => {});
                      }}
                      className="w-full h-auto max-h-[580px] object-contain pointer-events-none select-none mx-auto block"
                    />
                    {(settings.brandStatementText || settings.brandStatementSubtext) && (
                      <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
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

                {settings?.brandStatementImageUrl && (
                  <div className="relative rounded-2xl overflow-hidden bg-[#281044] shadow-md border border-neutral-200 flex items-center justify-center">
                    <img
                      src={settings.brandStatementImageUrl}
                      alt="RakoMart Brand Showcase"
                      className="w-full h-auto max-h-[580px] object-contain mx-auto block"
                    />
                    {(settings.brandStatementText || settings.brandStatementSubtext) && (
                      <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
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
          className="relative min-h-[220px] sm:min-h-[340px] lg:min-h-[440px] w-full rounded-2xl overflow-hidden shadow-lg bg-[#281044] border border-purple-900/40 cursor-pointer group flex flex-col justify-between p-6 sm:p-10 lg:p-12 select-none"
        >
          <div className="absolute inset-0 bg-radial from-purple-800/20 via-transparent to-transparent opacity-60 pointer-events-none" />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="text-white text-center leading-[0.88] uppercase font-bold tracking-normal animate-pulse duration-[3000ms]"
              style={{
                fontFamily: "'Mali', 'Sniglet', 'Fredoka', cursive",
                fontSize: 'clamp(3.5rem, 12vw, 9.5rem)',
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

  const desktopRatio = desktopMediaSrc ? aspectRatios[desktopMediaSrc] : null;
  const mobileRatio = mobileMediaSrc ? aspectRatios[mobileMediaSrc] : null;

  return (
    <div className={`relative w-full max-w-7xl mx-auto px-4 sm:px-6 ${position === 'hero2' ? 'my-2' : 'my-4 sm:my-6'}`}>
      {/* ========================================================================= */}
      {/* 1. DESKTOP HERO CONTAINER (Screen >= md, Recommended 1920 × 900 px) */}
      {/* ========================================================================= */}
      <div className="hidden md:block w-full">
        <div
          onClick={handleBannerClick}
          className={`relative w-full rounded-2xl overflow-hidden shadow-lg bg-[#281044] border border-purple-900/40 group select-none flex items-center justify-center ${currentBanner?.link ? 'cursor-pointer' : ''}`}
          style={{
            aspectRatio: desktopRatio ? `${desktopRatio}` : '1920/900',
            maxHeight: '900px',
            minHeight: '320px',
          }}
        >
          {/* Ambient blurred backdrop for seamless edge-to-edge aesthetics without harsh cropping */}
          {desktopMediaSrc && !desktopVideoError && (
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center filter blur-2xl opacity-20 scale-110 pointer-events-none"
              style={{ backgroundImage: `url(${currentBanner.image || desktopMediaSrc})` }}
            />
          )}

          {/* Desktop Media Display: Video or Image */}
          {isDesktopVideo && !desktopVideoError ? (
            <video
              ref={setDesktopVideoNode}
              key={`desktop-video-${desktopMediaSrc}`}
              src={desktopMediaSrc}
              poster={currentBanner.image || desktopMediaSrc}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              controlsList="nodownload nofullscreen noremoteplayback"
              onContextMenu={(e) => e.preventDefault()}
              onError={() => setDesktopVideoError(true)}
              onLoadedMetadata={(e) => {
                e.currentTarget.muted = true;
                e.currentTarget.play().catch(() => {});
                handleMediaLoad(desktopMediaSrc, e.currentTarget.videoWidth, e.currentTarget.videoHeight);
              }}
              onLoadedData={(e) => {
                e.currentTarget.muted = true;
                e.currentTarget.play().catch(() => {});
              }}
              onCanPlay={(e) => {
                e.currentTarget.muted = true;
                e.currentTarget.play().catch(() => {});
              }}
              onCanPlayThrough={(e) => {
                e.currentTarget.muted = true;
                e.currentTarget.play().catch(() => {});
              }}
              onTimeUpdate={(e) => {
                const v = e.currentTarget;
                if (v.duration && v.currentTime > 0 && v.duration - v.currentTime < 0.15) {
                  v.currentTime = 0;
                  v.play().catch(() => {});
                }
              }}
              onWaiting={(e) => {
                e.currentTarget.play().catch(() => {});
              }}
              onStalled={(e) => {
                e.currentTarget.play().catch(() => {});
              }}
              onEnded={(e) => {
                e.currentTarget.currentTime = 0;
                e.currentTarget.play().catch(() => {});
              }}
              onPause={(e) => {
                if (isPlaying) {
                  e.currentTarget.play().catch(() => {});
                }
              }}
              className="relative z-0 w-full h-full max-h-[900px] object-contain pointer-events-none select-none mx-auto block"
            />
          ) : (
            <img
              src={currentBanner.image || desktopMediaSrc}
              alt={currentBanner.title || 'RakoMart Hero Banner'}
              onLoad={(e) => handleMediaLoad(desktopMediaSrc, e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)}
              className="relative z-0 w-full h-full max-h-[900px] object-contain mx-auto block"
            />
          )}

          {/* Desktop Overlay Content */}
          {(currentBanner.title || currentBanner.subtitle) && (
            <div className="absolute inset-0 z-10 h-full flex flex-col justify-between p-8 lg:p-12 text-white pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/20">
              <div className="max-w-xl space-y-3 pointer-events-auto">
                <span className="inline-block px-3 py-1 bg-purple-600/90 backdrop-blur-md text-white text-xs font-extrabold uppercase rounded-full tracking-wider shadow-sm">
                  {position === 'hero2' ? 'RakoMart Featured Showcase' : 'Official RakoMart Feature'}
                </span>
                {currentBanner.title && (
                  <h2 className="text-3xl lg:text-5xl font-black leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                    {currentBanner.title}
                  </h2>
                )}
                {currentBanner.subtitle && (
                  <p className="text-sm lg:text-base text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] font-semibold line-clamp-2 max-w-lg">
                    {currentBanner.subtitle}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Desktop Pagination & Controls */}
          {activeBanners.length > 1 && (
            <div className="absolute bottom-4 right-6 z-20 pointer-events-auto">
              <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPlaying(!isPlaying);
                  }}
                  className="p-1 hover:text-purple-300 text-white transition-colors"
                  title={isPlaying ? 'Pause Slideshow' : 'Play Slideshow'}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <div className="flex items-center gap-1">
                  {activeBanners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex(idx);
                      }}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Desktop Prev / Next Navigation Arrows */}
          {activeBanners.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MOBILE HERO CONTAINER (Screen < md, Recommended 1080 × 1350 px) */}
      {/* ========================================================================= */}
      <div className="block md:hidden w-full">
        <div
          onClick={handleBannerClick}
          className={`relative w-full rounded-2xl overflow-hidden shadow-md bg-[#281044] border border-purple-900/40 group select-none flex items-center justify-center ${currentBanner?.link ? 'cursor-pointer' : ''}`}
          style={{
            aspectRatio: mobileRatio ? `${mobileRatio}` : '1080/1350',
            maxHeight: '650px',
            minHeight: '260px',
          }}
        >
          {/* Ambient blurred backdrop for mobile */}
          {mobileMediaSrc && !mobileVideoError && (
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center filter blur-xl opacity-25 scale-110 pointer-events-none"
              style={{ backgroundImage: `url(${currentBanner.mobileImage || currentBanner.image || mobileMediaSrc})` }}
            />
          )}

          {/* Mobile Media Display: Video or Image */}
          {isMobileVideo && !mobileVideoError ? (
            <video
              ref={setMobileVideoNode}
              key={`mobile-video-${mobileMediaSrc}`}
              src={mobileMediaSrc}
              poster={currentBanner.mobileImage || currentBanner.image || mobileMediaSrc}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              controlsList="nodownload nofullscreen noremoteplayback"
              onContextMenu={(e) => e.preventDefault()}
              onError={() => setMobileVideoError(true)}
              onLoadedMetadata={(e) => {
                e.currentTarget.muted = true;
                e.currentTarget.play().catch(() => {});
                handleMediaLoad(mobileMediaSrc, e.currentTarget.videoWidth, e.currentTarget.videoHeight);
              }}
              onLoadedData={(e) => {
                e.currentTarget.muted = true;
                e.currentTarget.play().catch(() => {});
              }}
              onCanPlay={(e) => {
                e.currentTarget.muted = true;
                e.currentTarget.play().catch(() => {});
              }}
              onCanPlayThrough={(e) => {
                e.currentTarget.muted = true;
                e.currentTarget.play().catch(() => {});
              }}
              onTimeUpdate={(e) => {
                const v = e.currentTarget;
                if (v.duration && v.currentTime > 0 && v.duration - v.currentTime < 0.15) {
                  v.currentTime = 0;
                  v.play().catch(() => {});
                }
              }}
              onWaiting={(e) => {
                e.currentTarget.play().catch(() => {});
              }}
              onStalled={(e) => {
                e.currentTarget.play().catch(() => {});
              }}
              onEnded={(e) => {
                e.currentTarget.currentTime = 0;
                e.currentTarget.play().catch(() => {});
              }}
              onPause={(e) => {
                if (isPlaying) {
                  e.currentTarget.play().catch(() => {});
                }
              }}
              className="relative z-0 w-full h-full max-h-[650px] object-contain pointer-events-none select-none mx-auto block"
            />
          ) : (
            <img
              src={currentBanner.mobileImage || currentBanner.image || mobileMediaSrc}
              alt={currentBanner.title || 'RakoMart Hero Banner'}
              onLoad={(e) => handleMediaLoad(mobileMediaSrc, e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)}
              className="relative z-0 w-full h-full max-h-[650px] object-contain mx-auto block"
            />
          )}

          {/* Mobile Overlay Content */}
          {(currentBanner.title || currentBanner.subtitle) && (
            <div className="absolute inset-0 z-10 h-full flex flex-col justify-between p-4 text-white pointer-events-none bg-gradient-to-t from-black/70 via-transparent to-black/30">
              <div className="max-w-xs space-y-1.5 pointer-events-auto">
                <span className="inline-block px-2.5 py-0.5 bg-purple-600/90 backdrop-blur-md text-white text-[9px] font-extrabold uppercase rounded-full tracking-wider shadow-sm">
                  {position === 'hero2' ? 'Featured' : 'Official'}
                </span>
                {currentBanner.title && (
                  <h2 className="text-lg sm:text-xl font-black leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                    {currentBanner.title}
                  </h2>
                )}
                {currentBanner.subtitle && (
                  <p className="text-[11px] sm:text-xs text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-medium line-clamp-2">
                    {currentBanner.subtitle}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Mobile Pagination & Controls */}
          {activeBanners.length > 1 && (
            <div className="absolute bottom-2.5 right-3 z-20 pointer-events-auto">
              <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPlaying(!isPlaying);
                  }}
                  className="p-0.5 hover:text-purple-300 text-white transition-colors"
                  title={isPlaying ? 'Pause Slideshow' : 'Play Slideshow'}
                >
                  {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </button>
                <div className="flex items-center gap-1">
                  {activeBanners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex(idx);
                      }}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mobile Prev / Next Navigation Arrows */}
          {activeBanners.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
                }}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center transition-all shadow-sm"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
                }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center transition-all shadow-sm"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
