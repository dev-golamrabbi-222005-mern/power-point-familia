import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className = '' }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className={`w-full text-left border-collapse ${className}`}>{children}</table>
    </div>
  );
};

export const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <thead className="bg-zinc-900/80 text-zinc-400 text-xs font-bold uppercase tracking-wider">{children}</thead>;
};

export const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <tbody className="divide-y divide-zinc-800/60 text-sm text-zinc-200">{children}</tbody>;
};

export const TableRow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return <tr className={`hover:bg-zinc-900/40 transition-colors ${className}`}>{children}</tr>;
};

export const TableHead: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return <th className={`p-3.5 ${className}`}>{children}</th>;
};

export const TableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return <td className={`p-3.5 ${className}`}>{children}</td>;
};
