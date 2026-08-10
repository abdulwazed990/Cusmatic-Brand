import React from 'react';

interface RakoMartLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export const RakoMartLogo: React.FC<RakoMartLogoProps> = ({ size = 'md', className = '', onClick }) => {
  const sizeClasses = {
    sm: 'h-9 px-3 py-1 text-base',
    md: 'h-11 px-4 py-1.5 text-lg sm:text-xl',
    lg: 'h-14 px-5 py-2 text-2xl',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center justify-center bg-[#281044] rounded-md shadow-sm border border-purple-900/40 select-none cursor-pointer transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] ${sizeClasses[size]} ${className}`}
      title="RakoMart — Better Living, Delivered."
    >
      <div className="flex items-center space-x-2">
        {/* Sleek RakoMart Emblem */}
        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-gradient-to-tr from-purple-500 to-pink-400 flex items-center justify-center font-bold text-white text-xs sm:text-sm tracking-tighter">
          R
        </div>
        
        {/* Wordmark */}
        <div className="flex flex-col justify-center leading-none">
          <span className="font-extrabold tracking-tight text-white font-sans drop-shadow-sm">
            Rako<span className="text-purple-300 font-semibold">Mart</span>
          </span>
          <span className="text-[10px] text-purple-200/90 font-medium font-bengali leading-none mt-0.5 tracking-wide">
            রকমর্ট
          </span>
        </div>
      </div>
    </div>
  );
};
