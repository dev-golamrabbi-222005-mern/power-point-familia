import React from "react";

interface PPFLogoProps {
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<PPFLogoProps> = ({
  className = "",
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 bg-[#0F0F0F] px-4 py-2 rounded-2xl border border-zinc-800/80 select-none cursor-pointer transition-all hover:border-zinc-700/80 ${className}`}
    >
      {/* POWER POINT Typography Block */}
      <div className="flex items-center font-black tracking-tight leading-none">
        {/* Giant Hero 'P' */}
        <span className="text-4xl md:text-5xl font-black bg-gradient-to-br from-sky-400 via-sky-500 to-cyan-500 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(56,189,248,0.3)]">
          P
        </span>

        {/* Stacked 'ower' and 'oint' */}
        <div className="flex flex-col justify-between h-8 md:h-9 text-[11px] md:text-[13px] font-extrabold tracking-widest text-sky-300 uppercase pl-0.5">
          <span className="leading-none bg-gradient-to-r from-sky-300 to-cyan-400 bg-clip-text text-transparent">
            ower
          </span>
          <span className="leading-none bg-gradient-to-r from-sky-400 to-cyan-500 bg-clip-text text-transparent">
            oint
          </span>
        </div>
      </div>

      {/* Sleek Vertical Divider Dot / Line */}
      <div className="h-6 w-[2px] bg-gradient-to-b from-sky-500/50 via-zinc-700 to-orange-500/50 rounded-full" />

      {/* FAMILIA Wordmark */}
      <div className="flex flex-col">
        <span className="text-xl md:text-2xl font-black tracking-wider bg-gradient-to-r from-orange-500 via-amber-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(249,115,22,0.25)] uppercase">
          Familia
        </span>
        <span className="text-[8.5px] font-bold tracking-[0.25em] text-zinc-500 uppercase -mt-1">
          Meal System
        </span>
      </div>
    </div>
  );
};

export default Logo;
