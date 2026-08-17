import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../state/AppContext';
import { BRICS_COUNTRIES } from '../../lib/constants';
import logoImg from '../../assets/logo.jpg';
import { 
  Map as MapIcon, 
  PlusCircle, 
  Flame, 
  TrendingUp, 
  Globe2, 
  BarChart3, 
  Database, 
  Settings as SettingsIcon, 
  Info, 
  Bell, 
  Menu, 
  X,
  ChevronDown,
  Shield,
  User,
  Activity,
  Sparkles,
  Check
} from 'lucide-react';

export default function Navbar() {
  const { 
    t, 
    language, 
    setLanguage, 
    activeCountry, 
    setActiveCountry, 
    activeRole, 
    setActiveRole, 
    currentScreen, 
    navigateTo,
    pendingAlertsCount 
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [regionMenuOpen, setRegionMenuOpen] = useState(false);

  const moreRef = useRef(null);
  const regionRef = useRef(null);

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setMoreMenuOpen(false);
      }
      if (regionRef.current && !regionRef.current.contains(event.target)) {
        setRegionMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Primary demo-critical nav items (Map, Report, Hotspots, Authority) + responsive items (Forecast, Cross-Border)
  const primaryNavItems = [
    { id: 'map', label: t.navMap || 'Map', icon: MapIcon },
    { id: 'report', label: t.navReport || 'Report', icon: PlusCircle },
    { id: 'hotspots', label: t.navHotspots || 'Hotspots', icon: Flame },
    { id: 'predictions', label: t.navPredictions || 'Forecast', icon: TrendingUp, hideOnTablet: true },
    { id: 'crossborder', label: t.navCrossBorder || 'Cross-Border', icon: Globe2, hideOnTablet: true },
    { id: 'authority', label: 'Authority', icon: Bell, badge: pendingAlertsCount },
  ];

  // Secondary overflow items
  const secondaryNavItems = [
    { id: 'predictions', label: t.navPredictions || 'Atmospheric Forecast', icon: TrendingUp, desc: '6h/12h/24h ML spike prediction', tabletOnly: true },
    { id: 'crossborder', label: t.navCrossBorder || 'Cross-Border Drift', icon: Globe2, desc: 'Trans-boundary plume models', tabletOnly: true },
    { id: 'landing', label: 'Overview & Mission', icon: Sparkles, desc: 'Public portal & BRICS mission' },
    { id: 'local-intelligence', label: 'Local Air Intelligence', icon: Activity, desc: 'Hyperlocal AQI & health guidance' },
    { id: 'analytics', label: t.navAnalytics || 'Analytics & Trends', icon: BarChart3, desc: 'Historical trends & CSV export' },
    { id: 'datasources', label: t.navSources || 'Data Sources', icon: Database, desc: 'Telemetry provenance registry' },
    { id: 'about', label: 'About & Responsible AI', icon: Info, desc: 'Governance principles & audit trail' },
    { id: 'settings', label: 'Settings & Config', icon: SettingsIcon, desc: 'Airshed & interface preferences' },
  ];

  const currentCountryObj = BRICS_COUNTRIES.find(c => c.id === activeCountry) || BRICS_COUNTRIES[0];

  return (
    <header className="sticky top-0 z-40 glass-nav shadow-sm font-sans select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* 1. Left: Logo & Wordmark */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer flex-shrink-0 group" 
            onClick={() => navigateTo('landing')}
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200/80 shadow-xs flex items-center justify-center bg-brand flex-shrink-0 group-hover:border-brand transition-colors">
              <img 
                src={logoImg} 
                alt="AtmosBridge" 
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-ink tracking-tight">AtmosBridge</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-brand/10 text-brand">
                BRICS AI
              </span>
            </div>
          </div>

          {/* 2. Center: Clean, Borderless Primary Nav Links Group */}
          <nav className="hidden md:flex items-center gap-0.5 lg:gap-1">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              const isTabletHidden = item.hideOnTablet ? 'hidden xl:flex' : 'flex';

              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className={`relative ${isTabletHidden} items-center gap-1.5 px-2.5 lg:px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                    isActive 
                      ? 'text-brand bg-brand/10 font-bold' 
                      : 'text-ink-muted hover:text-ink hover:bg-slate-100/60'
                  }`}
                >
                  <div className="relative">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-brand' : 'text-slate-500'}`} />
                    {item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-risk-critical animate-pulse" />
                    )}
                  </div>
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Overflow "More" Button */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
                  secondaryNavItems.some(i => i.id === currentScreen)
                    ? 'text-brand bg-brand/10 font-bold'
                    : 'text-ink-muted hover:text-ink hover:bg-slate-100/60'
                }`}
                aria-expanded={moreMenuOpen}
              >
                <span>More</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${moreMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 glass-popover py-2 z-50 animate-in fade-in-50 duration-150">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Extended Intelligence
                  </div>
                  {secondaryNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentScreen === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          navigateTo(item.id);
                          setMoreMenuOpen(false);
                        }}
                        className={`w-full flex items-start gap-2.5 px-3 py-2 text-left text-xs transition-colors ${
                          isActive ? 'bg-brand-surface text-brand font-semibold' : 'text-ink hover:bg-surface'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isActive ? 'text-brand' : 'text-slate-400'}`} />
                        <div>
                          <div className="font-semibold text-ink">{item.label}</div>
                          <div className="text-[11px] text-ink-muted leading-tight">{item.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* 3. Right: Unified Control Bar (Single Pill Container) */}
          <div className="hidden sm:flex items-center">
            
            <div className="glass-control-bar flex items-center px-1 py-0.5 text-xs shadow-xs">
              
              {/* Segment A: Persona Role Switcher */}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => { setActiveRole('citizen'); navigateTo('report'); }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                    activeRole === 'citizen' ? 'bg-white shadow-xs text-brand font-bold' : 'text-ink-muted hover:text-ink'
                  }`}
                  title="Citizen Persona"
                >
                  <User className="w-3 h-3" />
                  <span>Citizen</span>
                </button>

                <button
                  onClick={() => { setActiveRole('authority'); navigateTo('authority'); }}
                  className={`relative flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                    activeRole === 'authority' ? 'bg-white shadow-xs text-brand font-bold' : 'text-ink-muted hover:text-ink'
                  }`}
                  title="Municipal Authority Persona"
                >
                  <Shield className="w-3 h-3" />
                  <span>Authority</span>
                  {pendingAlertsCount > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-risk-critical animate-pulse" />
                  )}
                </button>
              </div>

              {/* Subtle Divider */}
              <div className="h-4 w-[1px] bg-slate-300/80 mx-1.5" />

              {/* Segment B: Airshed Region & Language Popover Trigger */}
              <div className="relative" ref={regionRef}>
                <button
                  onClick={() => setRegionMenuOpen(!regionMenuOpen)}
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold text-ink hover:text-brand transition-colors"
                  title="Select BRICS Airshed & Language"
                >
                  <Globe2 className="w-3.5 h-3.5 text-brand" />
                  <span className="truncate max-w-[65px]">
                    {activeCountry === 'all' ? 'BRICS' : currentCountryObj.name}
                  </span>
                  <span className="font-mono text-[10px] uppercase font-bold text-slate-500">
                    {language}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {regionMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 glass-popover p-3 z-50 space-y-3 animate-in fade-in-50 duration-150">
                    
                    {/* Region Selection */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        BRICS Airshed Node
                      </div>
                      <div className="space-y-0.5">
                        {BRICS_COUNTRIES.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setActiveCountry(c.id);
                              setRegionMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs text-left transition-colors ${
                              activeCountry === c.id 
                                ? 'bg-brand text-white font-semibold' 
                                : 'text-ink hover:bg-surface'
                            }`}
                          >
                            <span>{c.name}</span>
                            {activeCountry === c.id && <Check className="w-3.5 h-3.5" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Language Selection */}
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Language
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { id: 'en', label: 'EN' },
                          { id: 'hi', label: 'हिन्दी' },
                          { id: 'bn', label: 'বাংলা' }
                        ].map((lang) => (
                          <button
                            key={lang.id}
                            onClick={() => {
                              setLanguage(lang.id);
                              setRegionMenuOpen(false);
                            }}
                            className={`py-1 text-xs rounded-full text-center transition-colors font-medium ${
                              language === lang.id
                                ? 'bg-brand text-white font-bold'
                                : 'bg-surface text-ink hover:bg-slate-200'
                            }`}
                          >
                            {lang.label}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>

            </div>

          </div>

          {/* 4. Mobile Menu Trigger + Alert Icon */}
          <div className="flex md:hidden items-center gap-1.5">
            {pendingAlertsCount > 0 && (
              <button
                onClick={() => navigateTo('authority')}
                className="relative p-1.5 rounded-full text-ink-muted hover:text-ink"
                title={`${pendingAlertsCount} Pending Alerts`}
              >
                <Bell className="w-5 h-5 text-brand" />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-risk-critical animate-pulse" />
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-full text-ink-muted hover:text-ink hover:bg-slate-100/60"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-lg border-b border-slate-200 px-4 pt-3 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-150">
          
          {/* Persona Role Switcher */}
          <div className="glass-control-bar flex items-center justify-center p-0.5 max-w-xs mx-auto text-xs">
            <button
              onClick={() => { setActiveRole('citizen'); navigateTo('report'); setMobileMenuOpen(false); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeRole === 'citizen' ? 'bg-white shadow-xs text-brand font-bold' : 'text-ink-muted hover:text-ink'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Citizen</span>
            </button>
            <button
              onClick={() => { setActiveRole('authority'); navigateTo('authority'); setMobileMenuOpen(false); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeRole === 'authority' ? 'bg-white shadow-xs text-brand font-bold' : 'text-ink-muted hover:text-ink'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Authority</span>
              {pendingAlertsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-risk-critical animate-pulse" />
              )}
            </button>
          </div>

          {/* Primary Nav List */}
          <div className="grid grid-cols-2 gap-2">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigateTo(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-full text-xs font-semibold text-left transition-colors ${
                    isActive ? 'bg-brand text-white' : 'bg-surface text-ink hover:bg-slate-200/80'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-risk-critical" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Secondary Nav Links */}
          <div className="pt-3 border-t border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              More Intelligence
            </div>
            <div className="grid grid-cols-2 gap-2">
              {secondaryNavItems.filter(i => !i.tabletOnly).map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigateTo(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-left ${
                      isActive ? 'bg-brand-surface text-brand font-semibold' : 'text-ink-muted hover:text-ink hover:bg-surface'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Region & Language Selector */}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-muted font-medium">BRICS Airshed:</span>
              <select
                value={activeCountry}
                onChange={(e) => setActiveCountry(e.target.value)}
                className="select-control text-xs"
              >
                {BRICS_COUNTRIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-muted font-medium">Language:</span>
              <div className="flex gap-1">
                <button onClick={() => setLanguage('en')} className={`px-3 py-1 text-xs rounded-full font-semibold ${language === 'en' ? 'bg-brand text-white' : 'bg-surface text-ink'}`}>EN</button>
                <button onClick={() => setLanguage('hi')} className={`px-3 py-1 text-xs rounded-full font-semibold ${language === 'hi' ? 'bg-brand text-white' : 'bg-surface text-ink'}`}>हिन्दी</button>
                <button onClick={() => setLanguage('bn')} className={`px-3 py-1 text-xs rounded-full font-semibold ${language === 'bn' ? 'bg-brand text-white' : 'bg-surface text-ink'}`}>বাংলা</button>
              </div>
            </div>
          </div>

        </div>
      )}
    </header>
  );
}
