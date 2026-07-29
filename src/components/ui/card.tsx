import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => {
  return <div className={`mb-4 ${className}`}>{children}</div>;
};

export const CardTitle: React.FC<CardProps> = ({ children, className = '' }) => {
  return <h3 className={`font-display font-bold text-lg text-zinc-100 ${className}`}>{children}</h3>;
};

export const CardContent: React.FC<CardProps> = ({ children, className = '' }) => {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
};
