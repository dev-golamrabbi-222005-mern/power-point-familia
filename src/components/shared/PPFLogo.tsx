import React from 'react';

export const PPFLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className="flex items-center gap-2 select-none">
      <div className="relative flex items-center justify-center p-2 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-xl shadow-md text-white font-black tracking-tighter">
        <span className={sizes[size]}>PPF</span>
      </div>
      <div>
        <span className={`font-display font-extrabold tracking-tight text-zinc-100 ${sizes[size]}`}>
          Power Point <span className="text-emerald-500">Familia</span>
        </span>
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Meal System</p>
      </div>
    </div>
  );
};
