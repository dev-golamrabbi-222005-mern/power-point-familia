import React from 'react';
import { Toggle } from '../../ui/toggle';
import { ShieldCheck, User } from 'lucide-react';

interface DualRoleToggleProps {
  isManagerMode: boolean;
  onToggle: (mode: boolean) => void;
}

export const DualRoleToggle: React.FC<DualRoleToggleProps> = ({ isManagerMode, onToggle }) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
      {isManagerMode ? (
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
      ) : (
        <User className="w-4 h-4 text-zinc-400" />
      )}
      <Toggle
        checked={isManagerMode}
        onChange={onToggle}
        label={isManagerMode ? 'Manager Control Mode' : 'Personal Member Mode'}
      />
    </div>
  );
};
