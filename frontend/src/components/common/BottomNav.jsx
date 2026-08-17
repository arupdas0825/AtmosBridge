import React from 'react';
import { useApp } from '../../state/AppContext';
import { 
  Globe2, 
  Map as MapIcon, 
  PlusCircle, 
  Flame, 
  TrendingUp, 
  Bell 
} from 'lucide-react';

export default function BottomNav() {
  const { currentScreen, navigateTo, pendingAlertsCount } = useApp();

  const items = [
    { id: 'map', label: 'Map', icon: MapIcon },
    { id: 'hotspots', label: 'Hotspots', icon: Flame },
    { id: 'report', label: 'Report', icon: PlusCircle, isPrimary: true },
    { id: 'predictions', label: 'Forecast', icon: TrendingUp },
    { id: 'authority', label: 'Alerts', icon: Bell, badge: pendingAlertsCount },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/92 backdrop-blur-lg border-t border-slate-200/80 px-3 py-1 flex items-center justify-around shadow-lg font-sans">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentScreen === item.id;

        if (item.isPrimary) {
          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className="flex flex-col items-center justify-center -translate-y-3 group"
              aria-label="Report Pollution Incident"
            >
              <div className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/25 active:scale-95 transition-transform">
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-brand mt-0.5">{item.label}</span>
            </button>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => navigateTo(item.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-full transition-colors ${
              isActive ? 'text-brand font-bold' : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-[10px] mt-0.5">{item.label}</span>
            {item.badge > 0 && (
              <span className="absolute top-0.5 right-2 w-2 h-2 rounded-full bg-risk-critical animate-pulse" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
