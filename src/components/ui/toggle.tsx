import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label, disabled = false }) => {
  return (
    <label className={`inline-flex items-center gap-3 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <div
        onClick={() => !disabled && onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-emerald-600' : 'bg-zinc-800'}`}
      >
        <div
          className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 left-0.5 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </div>
      {label && <span className="text-sm text-zinc-300 font-medium">{label}</span>}
    </label>
  );
};
