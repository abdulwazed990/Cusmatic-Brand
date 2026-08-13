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
    sm: 'h-8 sm:h-9 max-w-[130px]',
    md: 'h-10 sm:h-12 max-w-[170px]',
    lg: 'h-12 sm:h-16 max-w-[220px]',
  };

  if (variant === 'light') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center justify-center select-none cursor-pointer group transition-transform hover:scale-[1.02] active:scale-[0.98] ${className}`}
        title="RakoMart"
      >
        <img
          src={logoSrc}
          alt="RakoMart official logo"
          className={`${logoDimensions[size]} w-auto object-contain rounded-xl shadow-xs border border-purple-100/80 bg-white shrink-0 p-0.5`}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center justify-center bg-[#281044] p-1.5 sm:p-2 rounded-2xl shadow-sm border border-purple-900/40 select-none cursor-pointer transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] ${className}`}
      title="RakoMart"
    >
      <img
        src={logoSrc}
        alt="RakoMart official logo"
        className={`${logoDimensions[size]} w-auto object-contain rounded-xl border border-white/20 bg-white shrink-0 shadow-2xs`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

