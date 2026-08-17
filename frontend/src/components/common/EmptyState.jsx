import React from 'react';
import { Wind, ArrowRight } from 'lucide-react';

export default function EmptyState({ 
  title = 'No active incidents found', 
  description = 'There are no reported pollution events or high-risk hotspots in this view.',
  actionText = null,
  onAction = null,
  icon: Icon = Wind
}) {
  return (
    <div className="card-surface p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto my-8">
      <div className="w-12 h-12 rounded-full bg-brand-surface text-brand flex items-center justify-center mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-ink mb-1">{title}</h3>
      <p className="text-sm text-ink-muted mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button onClick={onAction} className="btn-primary">
          <span>{actionText}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
