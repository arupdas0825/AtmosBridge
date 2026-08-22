import React from 'react';
import { useApp } from '../../state/AppContext';
import { GlassFilter } from '../ui/liquid-glass-button';
import { 
  Map as MapIcon, 
  PlusCircle, 
  Flame, 
  TrendingUp, 
  Building2, 
  Globe2, 
  Home, 
  Activity 
} from 'lucide-react';

export default function BottomNav() {
  const { currentScreen, navigateTo, activeRole } = useApp();

  const isAuthority = activeRole === 'authority';

  // Citizen Surface Mobile Dock Items
  const citizenItems = [
    { 
      id: 'landing', 
      label: 'Home', 
      icon: Home, 
      activeCheck: (s) => s === 'landing' 
    },
    { 
      id: 'local-intelligence', 
      label: 'Local Air', 
      icon: Activity, 
      activeCheck: (s) => s === 'local-intelligence' 
    },
    { 
      id: 'report', 
      label: 'Report', 
      icon: PlusCircle, 
      isPrimary: true, 
      activeCheck: (s) => s === 'report' || s === 'voice' || s === 'analysis-result' 
    },
    { 
      id: 'hotspots', 
      label: 'Hotspots', 
      icon: Flame, 
      activeCheck: (s) => s === 'hotspots' || s === 'event-details' 
    },
    { 
      id: 'map', 
      label: 'Live Map', 
      icon: MapIcon, 
      activeCheck: (s) => s === 'map' 
    },
  ];

  // Authority Surface Mobile Dock Items
  const authorityItems = [
    { 
      id: 'authority', 
      label: 'Command', 
      icon: Building2, 
      isPrimary: true,
      activeCheck: (s) => s === 'authority' || s === 'alert-details' 
    },
    { 
      id: 'hotspots', 
      label: 'Hotspots', 
      icon: Flame, 
      activeCheck: (s) => s === 'hotspots' 
    },
    { 
      id: 'predictions', 
      label: 'Forecast', 
      icon: TrendingUp, 
      activeCheck: (s) => s === 'predictions' 
    },
    { 
      id: 'crossborder', 
      label: 'Cross-Border', 
      icon: Globe2, 
      activeCheck: (s) => s === 'crossborder' 
    },
    { 
      id: 'map', 
      label: 'Geo Map', 
      icon: MapIcon, 
      activeCheck: (s) => s === 'map' 
    },
  ];

  const items = isAuthority ? authorityItems : citizenItems;

  return (
    <>
      <GlassFilter />
      <nav 
        className={`lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md h-[68px] rounded-full font-sans select-none pointer-events-auto transition-all duration-300 backdrop-blur-2xl ${
          isAuthority 
            ? 'bg-slate-950/85 border border-slate-700/80 shadow-[0_8px_32px_rgba(0,0,0,0.5)]' 
            : 'bg-white/80 border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.12)]'
        }`}
        aria-label="Mobile Navigation Dock"
      >
        {/* Specular Liquid Glass Edge Shadows */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none 
            shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(0,0,0,0.9),inset_-3px_-3px_0.5px_-3px_rgba(0,0,0,0.85),inset_1px_1px_1px_-0.5px_rgba(0,0,0,0.6),inset_-1px_-1px_1px_-0.5px_rgba(0,0,0,0.6),inset_0_0_6px_6px_rgba(0,0,0,0.08),inset_0_0_2px_2px_rgba(0,0,0,0.04),0_0_12px_rgba(255,255,255,0.2)]" 
        />

        <div className="relative z-20 h-full px-2 flex items-center justify-around">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.activeCheck ? item.activeCheck(currentScreen) : currentScreen === item.id;

            if (item.isPrimary) {
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className="flex flex-col items-center justify-center -translate-y-3 group transition-transform duration-200 active:scale-95 min-w-[56px] min-h-[44px]"
                  aria-label={item.label}
                >
                  <div 
                    className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full text-white flex items-center justify-center border relative overflow-hidden group-hover:scale-105 transition-all duration-300 shadow-xl ${
                      isAuthority
                        ? 'bg-gradient-to-br from-teal-500 via-teal-700 to-slate-950 border-teal-400/50 shadow-teal-900/60'
                        : 'bg-gradient-to-br from-brand via-brand-dark to-brand-darker border-white/50 shadow-brand/40'
                    }`}
                  >
                    <Icon className="w-6 h-6 stroke-[2.5]" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/25 to-transparent pointer-events-none" />
                  </div>
                  <span className={`text-[10px] font-extrabold mt-1 tracking-tight transition-colors ${
                    isAuthority 
                      ? isActive ? 'text-teal-300' : 'text-slate-300' 
                      : isActive ? 'text-brand' : 'text-slate-700'
                  }`}>
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-200 active:scale-95 min-w-[50px] min-h-[44px] ${
                  isAuthority
                    ? isActive 
                      ? 'text-teal-300 font-bold bg-teal-900/50 shadow-xs' 
                      : 'text-slate-400 hover:text-slate-100'
                    : isActive 
                      ? 'text-brand font-bold bg-brand/10 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-900'
                }`}
                aria-label={item.label}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px] mt-0.5 font-semibold tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
