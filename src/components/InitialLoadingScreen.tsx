import React from 'react';

export const InitialLoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FC] text-neutral-900 font-sans antialiased animate-fadeIn">
      {/* 1. Header Skeleton */}
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-4">
          {/* Logo Skeleton */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-neutral-200 rounded-lg animate-pulse md:hidden" />
            <div className="h-10 sm:h-12 w-36 sm:w-44 bg-neutral-200/80 rounded-2xl animate-pulse" />
          </div>

          {/* Search Bar Skeleton (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="w-full h-10 bg-neutral-100 rounded-full border border-neutral-200/80 animate-pulse" />
          </div>

          {/* Cart Trigger Skeleton */}
          <div className="w-10 h-10 rounded-full bg-neutral-200/80 animate-pulse" />
        </div>
      </header>

      {/* 2. Main Body Skeleton */}
      <main className="flex-1 space-y-10 pb-8 pt-4">
        {/* Hero Banner Section Skeleton */}
        <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6">
          <div className="relative w-full rounded-2xl overflow-hidden shadow-xs border border-purple-900/10 bg-gradient-to-r from-[#281044] via-[#38155e] to-[#281044] animate-pulse">
            {/* Desktop Aspect Ratio Box (21:9) & Mobile Aspect Ratio Box (4:5) */}
            <div className="hidden md:block w-full" style={{ paddingBottom: '38%' }}></div>
            <div className="block md:hidden w-full" style={{ paddingBottom: '90%' }}></div>

            {/* Centered Minimal Brand Glow */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-3 p-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
                <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              </div>
              <div className="text-center space-y-1">
                <div className="text-xs sm:text-sm font-bold tracking-wider text-purple-200 uppercase">
                  RakoMart
                </div>
                <div className="text-[11px] text-purple-300/80 font-medium">
                  Loading catalog...
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Showcase Skeleton */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <div className="space-y-1">
              <div className="h-5 w-36 bg-neutral-200 rounded-md animate-pulse" />
              <div className="h-3 w-48 bg-neutral-200/70 rounded-md animate-pulse" />
            </div>
            <div className="h-4 w-16 bg-neutral-200 rounded-md animate-pulse" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-neutral-200/80 p-3 flex flex-col items-center justify-center space-y-2 min-h-[110px]"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-neutral-100 animate-pulse" />
                <div className="h-3 w-16 bg-neutral-200 rounded-md animate-pulse" />
              </div>
            ))}
          </div>
        </section>

        {/* Featured Products Grid Skeleton */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <div className="space-y-1">
              <div className="h-3 w-32 bg-purple-200 rounded-md animate-pulse" />
              <div className="h-6 w-64 bg-neutral-200 rounded-md animate-pulse" />
            </div>
            <div className="h-4 w-20 bg-neutral-200 rounded-md animate-pulse" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-neutral-200/80 p-3 space-y-3 shadow-2xs"
              >
                <div className="w-full aspect-square bg-neutral-100 rounded-xl animate-pulse" />
                <div className="space-y-2 pt-1">
                  <div className="h-4 w-3/4 bg-neutral-200 rounded-md animate-pulse" />
                  <div className="h-3 w-1/2 bg-neutral-100 rounded-md animate-pulse" />
                  <div className="flex items-center justify-between pt-2">
                    <div className="h-5 w-20 bg-purple-100 rounded-md animate-pulse" />
                    <div className="h-8 w-16 bg-neutral-200 rounded-lg animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
