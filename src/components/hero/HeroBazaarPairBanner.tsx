import React from 'react';
import { Users } from 'lucide-react';

interface HeroBazaarPairBannerProps {
  bazaarPairData: {
    currentPair?: { member1Name: string; member2Name: string };
    nextPair?: { member1Name: string; member2Name: string };
  } | null;
}

export const HeroBazaarPairBanner: React.FC<HeroBazaarPairBannerProps> = ({ bazaarPairData }) => {
  if (!bazaarPairData || !bazaarPairData.currentPair) return null;

  return (
    <div className="container-custom mt-10">
      <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/5 border border-blue-500/20 rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/15 rounded-xl">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
              Current Bazaar Pair
            </p>
            <p className="text-lg font-black text-zinc-100">
              {bazaarPairData.currentPair.member1Name}{" "}
              <span className="text-zinc-500 text-sm">&</span>{" "}
              {bazaarPairData.currentPair.member2Name}
            </p>
            {bazaarPairData.nextPair && (
              <p className="text-[10px] text-zinc-500 mt-0.5">
                Next up: {bazaarPairData.nextPair.member1Name} &{" "}
                {bazaarPairData.nextPair.member2Name}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] text-blue-400 font-bold">
            ACTIVE
          </span>
        </div>
      </div>
    </div>
  );
};
