import React from 'react';
import { PROVENANCE_CONFIG } from '../../lib/constants';
import { Radio, Sparkles, TrendingUp, Cpu, Info } from 'lucide-react';

const iconMap = {
  Radio: Radio,
  Sparkles: Sparkles,
  TrendingUp: TrendingUp,
  Cpu: Cpu
};

export default function ProvenanceTag({ type = 'observed', size = 'sm', showTooltip = true }) {
  const normType = (type || 'observed').toLowerCase();
  const config = PROVENANCE_CONFIG[normType] || PROVENANCE_CONFIG.observed;
  const IconComponent = iconMap[config.icon] || Info;

  const sizeClasses = size === 'xs' 
    ? 'text-[10px] px-1.5 py-0.5 gap-1' 
    : size === 'md'
    ? 'text-xs px-2.5 py-1 gap-1.5'
    : 'text-[11px] px-2 py-0.5 gap-1';

  return (
    <span 
      className={`inline-flex items-center font-medium font-mono border rounded-full ${config.badge} ${sizeClasses}`}
      title={showTooltip ? `${config.label}: ${config.desc}` : undefined}
    >
      <IconComponent className="w-3 h-3 flex-shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}
