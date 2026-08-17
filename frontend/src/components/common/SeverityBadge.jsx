import React from 'react';
import { SEVERITY_CONFIG } from '../../lib/constants';
import { ShieldCheck, Eye, AlertTriangle, AlertOctagon } from 'lucide-react';

const icons = {
  1: ShieldCheck,
  2: Eye,
  3: AlertTriangle,
  4: AlertOctagon
};

export default function SeverityBadge({ severity = 1, size = 'sm', showIcon = true }) {
  const num = typeof severity === 'number' ? severity : (
    severity === 'critical' ? 4 : severity === 'high' ? 3 : severity === 'watch' ? 2 : 1
  );
  const cfg = SEVERITY_CONFIG[num] || SEVERITY_CONFIG[1];
  const IconComponent = icons[num] || ShieldCheck;

  const sizeStyles = size === 'lg' 
    ? 'text-sm px-3.5 py-1.5 gap-2 font-semibold'
    : size === 'xs'
    ? 'text-[10px] px-2 py-0.5 gap-1 font-medium'
    : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  return (
    <span 
      className={`inline-flex items-center rounded-full border ${cfg.badgeBg} ${cfg.text} ${cfg.border} ${sizeStyles}`}
    >
      {showIcon && <IconComponent className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{cfg.label}</span>
      <span className="font-mono opacity-70 text-[10px]">L{num}</span>
    </span>
  );
}
