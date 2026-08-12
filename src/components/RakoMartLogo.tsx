import React from 'react';
import { useStore } from '../context/StoreContext';

export const OFFICIAL_LOGO_SRC = '/rakomart-official-logo.jpg';

export const RakoMartLogoIcon: React.FC<{ className?: string }> = ({
  className = "w-7 h-7",
}) => {
  let logoSrc = OFFICIAL_LOGO_SRC;
  try {
    const { settings } = useStore();
    if (settings?.siteLogoUrl) {
      logoSrc = settings.siteLogoUrl;
    }
  } catch {
    // fallback
  }

  return (
    <img
      src={logoSrc}
      alt="RakoMart official logo"
      className={`${className} object-contain rounded-lg shrink-0`}
      referrerPolicy="no-referrer"
    />
  );
};

interface RakoMartLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  variant?: 'dark' | 'light';
}

export const RakoMartLogo: React.FC<RakoMartLogoProps> = ({ size = 'md', className = '', onClick, variant = 'dark' }) => {
  let logoSrc = OFFICIAL_LOGO_SRC;
  try {
    const { settings } = useStore();
    if (settings?.siteLogoUrl) {
      logoSrc = settings.siteLogoUrl;
    }
  } catch {
    // fallback
  }

  const logoDimensions = {
    sm: 'w-8 h-8 sm:w-9 sm:h-9',
    md: 'w-10 h-10 sm:w-11 sm:h-11',
    lg: 'w-12 h-12 sm:w-14 sm:h-14',
  };

  const textSizes = {
    sm: 'text-sm sm:text-base',
    md: 'text-base sm:text-lg',
    lg: 'text-xl sm:text-2xl',
  };

  if (variant === 'light') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center gap-2.5 select-none cursor-pointer group ${className}`}
        title="RakoMart Official Store"
      >
        <img
          src={logoSrc}
          alt="RakoMart official logo"
          className={`${logoDimensions[size]} object-contain rounded-xl shadow-xs transition-transform group-hover:scale-105 border border-purple-100/80 bg-white shrink-0`}
          referrerPolicy="no-referrer"
        />
        <div className="flex flex-col justify-center leading-none">
          <span className={`font-extrabold tracking-tight text-[#281044] font-sans ${textSizes[size]}`}>
            Rako<span className="text-purple-600 font-semibold">Mart</span>
          </span>
          <span className="text-[10px] text-purple-800/80 font-semibold leading-none mt-0.5 tracking-wide uppercase">
            Official Store
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 bg-[#281044] px-3.5 py-1.5 rounded-2xl shadow-sm border border-purple-900/40 select-none cursor-pointer transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] ${className}`}
      title="RakoMart Official Store"
    >
      <img
        src={logoSrc}
        alt="RakoMart official logo"
        className={`${logoDimensions[size]} object-contain rounded-xl border border-white/20 bg-white shrink-0 shadow-2xs`}
        referrerPolicy="no-referrer"
      />
      <div className="flex flex-col justify-center leading-none">
        <span className={`font-extrabold tracking-tight text-white font-sans drop-shadow-xs ${textSizes[size]}`}>
          Rako<span className="text-purple-300 font-semibold">Mart</span>
        </span>
        <span className="text-[10px] text-purple-200/90 font-medium leading-none mt-0.5 tracking-wide uppercase">
          Official Store
        </span>
      </div>
    </div>
  );
};

