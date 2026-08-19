import React from 'react';
import { useApp } from '../../state/AppContext';
import { 
  Map as MapIcon, 
  PlusCircle, 
  Flame, 
  TrendingUp, 
  Bell,
  Building2,
  Globe2,
  Home,
  Sparkles,
  Activity,
  Shield
} from 'lucide-react';

export default function BottomNav() {
  const { currentScreen, navigateTo, activeRole, pendingAlertsCount } = useApp();

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
    <nav 
      className={`lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md h-[68px] rounded-3xl font-sans select-none pointer-events-auto transition-all duration-300 ${
        isAuthority ? 'bg-slate-900/90 border border-slate-700 shadow-2xl' : 'bg-white/80 border border-white/60 shadow-xl'
      } backdrop-blur-xl`}
      aria-label="Mobile Navigation Dock"
    >
      <div className="relative z-20 h-full px-2 flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.activeCheck ? item.activeCheck(currentScreen) : currentScreen === item.id;

          if (item.isPrimary) {
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className="flex flex-col items-center justify-center -translate-y-2 group transition-transform duration-300 active:scale-95 min-w-[56px] min-h-[44px]"
                aria-label={item.label}
              >
                <div 
                  className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full text-white flex items-center justify-center border relative overflow-hidden group-hover:scale-105 transition-all duration-300 shadow-lg ${
                    isAuthority
                      ? 'bg-gradient-to-br from-teal-500 via-teal-700 to-slate-900 border-teal-400/40 shadow-teal-900/50'
                      : 'bg-gradient-to-br from-[#00A896] via-[#028090] to-[#05668D] border-white/40 shadow-[#00A896]/35'
                  }`}
                >
                  <Icon className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className={`text-[10px] font-bold mt-1 tracking-tight transition-colors ${
                  isAuthority 
                    ? isActive ? 'text-teal-400' : 'text-slate-300' 
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
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 sm:px-3 rounded-2xl transition-all duration-300 active:scale-95 min-w-[50px] min-h-[44px] ${
                isAuthority
                  ? isActive 
                    ? 'text-teal-400 font-bold bg-teal-900/40' 
                    : 'text-slate-400 hover:text-slate-100'
                  : isActive 
                    ? 'text-brand font-bold bg-brand/10' 
                    : 'text-slate-500 hover:text-slate-900'
              }`}
              aria-label={item.label}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 font-medium tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
