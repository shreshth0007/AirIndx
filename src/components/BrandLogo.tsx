import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', variant = 'dark', onClick }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  };

  return (
    <div onClick={onClick} className="flex items-center space-x-2.5 cursor-pointer select-none group">
      {/* Professional Graphic Emblem */}
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 shadow-lg ${iconSizes[size]} group-hover:scale-105 transition-transform duration-300 shadow-cyan-500/25 border border-cyan-400/30`}>
        <svg className="w-3/5 h-3/5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer Globe Ring */}
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" strokeDasharray="4 2" opacity="0.6" />
          {/* Atmosphere Core */}
          <path d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          {/* Vibrant Air Arc */}
          <path d="M7 12C9.5 9.5 14.5 9.5 17 12C19.5 14.5 21 13 21 12" stroke="#38BDF8" strokeWidth="2.2" strokeLinecap="round" />
          {/* Glowing Pulse Dot */}
          <circle cx="12" cy="12" r="2.5" fill="#34D399" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex items-baseline space-x-1">
        <span className={`font-black tracking-tight ${textSizes[size]} ${variant === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          Air<span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 bg-clip-text text-transparent">Indx</span>
        </span>
        <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest shadow-sm">
          PRO
        </span>
      </div>
    </div>
  );
};
