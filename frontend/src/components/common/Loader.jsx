import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loader({ text = 'Loading intelligence feeds...', size = 'md' }) {
  const sizeClasses = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 gap-3 text-ink-muted">
      <Loader2 className={`${sizeClasses} animate-spin text-brand`} />
      <p className="text-sm font-medium animate-pulse">{text}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card-surface p-5 animate-pulse space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
        <div className="h-4 bg-slate-200 rounded-full w-16"></div>
      </div>
      <div className="h-5 bg-slate-200 rounded w-3/4"></div>
      <div className="space-y-2 pt-2">
        <div className="h-3 bg-slate-100 rounded w-full"></div>
        <div className="h-3 bg-slate-100 rounded w-5/6"></div>
      </div>
    </div>
  );
}
