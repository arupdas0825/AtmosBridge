import React from 'react';
import { useApp } from '../../state/AppContext';
import { 
  Map as MapIcon, 
  PlusCircle, 
  Flame, 
  TrendingUp, 
  Bell 
} from 'lucide-react';

// SVG Glass Distortion Filter
const GlassFilter = () => (
  <svg style={{ display: 'none' }}>
    <filter
      id="glass-distortion"
      x="0%"
      y="0%"
      width="100%"
      height="100%"
      filterUnits="objectBoundingBox"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.001 0.005"
        numOctaves="1"
        seed="17"
        result="turbulence"
      />
      <feComponentTransfer in="turbulence" result="mapped">
        <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
        <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
        <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
      </feComponentTransfer>
      <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
      <feSpecularLighting
        in="softMap"
        surfaceScale="5"
        specularConstant="1"
        specularExponent="100"
        lightingColor="white"
        result="specLight"
      >
        <fePointLight x="-200" y="-200" z="300" />
      </feSpecularLighting>
      <feComposite
        in="specLight"
        operator="arithmetic"
        k1="0"
        k2="1"
        k3="1"
        k4="0"
        result="litImage"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="softMap"
        scale="200"
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  </svg>
);

export default function BottomNav() {
  const { currentScreen, navigateTo, pendingAlertsCount } = useApp();

  const items = [
    { 
      id: 'map', 
      label: 'Map', 
      icon: MapIcon, 
      activeCheck: (s) => s === 'map' || s === 'landing' 
    },
    { 
      id: 'hotspots', 
      label: 'Hotspots', 
      icon: Flame, 
      activeCheck: (s) => s === 'hotspots' || s === 'event-details' 
    },
    { 
      id: 'report', 
      label: 'Report', 
      icon: PlusCircle, 
      isPrimary: true, 
      activeCheck: (s) => s === 'report' || s === 'voice' || s === 'analysis-result' 
    },
    { 
      id: 'predictions', 
      label: 'Forecast', 
      icon: TrendingUp, 
      activeCheck: (s) => s === 'predictions' 
    },
    { 
      id: 'authority', 
      label: 'Alerts', 
      icon: Bell, 
      badge: pendingAlertsCount, 
      activeCheck: (s) => s === 'authority' || s === 'alert-details' 
    },
  ];

  return (
    <>
      <GlassFilter />
      <nav 
        className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md h-[68px] rounded-3xl font-sans select-none pointer-events-auto transition-all duration-300"
        style={{
          boxShadow: '0 12px 32px -4px rgba(0, 0, 0, 0.18), 0 4px 16px -2px rgba(0, 168, 150, 0.12)',
        }}
        aria-label="Mobile Floating Glass Navigation Dock"
      >
        {/* Glass Base Layer */}
        <div 
          className="absolute inset-0 z-0 rounded-3xl overflow-hidden backdrop-blur-xl bg-white/75 border border-white/60"
          style={{
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        />

        {/* Inner Glass Glow & Highlight Specular Boundary */}
        <div 
          className="absolute inset-0 z-10 rounded-3xl overflow-hidden pointer-events-none"
          style={{
            boxShadow: 'inset 1.5px 1.5px 1px 0 rgba(255, 255, 255, 0.7), inset -1px -1px 1px 1px rgba(255, 255, 255, 0.3)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)'
          }}
        />

        {/* Interactive Dock Content */}
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
                  aria-label="Report Pollution Incident"
                >
                  <div 
                    className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#00A896] via-[#028090] to-[#05668D] text-white flex items-center justify-center border border-white/40 relative overflow-hidden group-hover:scale-105 transition-all duration-300"
                    style={{
                      boxShadow: '0 8px 20px rgba(0, 168, 150, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.6)'
                    }}
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Icon className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <span className={`text-[10px] font-bold mt-1 tracking-tight transition-colors ${
                    isActive ? 'text-[#00A896]' : 'text-slate-700'
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
                  isActive 
                    ? 'text-[#00A896] font-bold bg-[#00A896]/12 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
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
    </>
  );
}
