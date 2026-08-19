import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../state/AppContext';
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
  Home,
  Sparkles,
  Check,
  Building2,
  RefreshCw,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export default function Navbar() {
  const { 
    language, 
    setLanguage, 
    activeRole, 
    setActiveRole, 
    currentScreen, 
    navigateTo,
    pendingAlertsCount,
    alertsList,
    refreshData,
    surfaceToast
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [surfaceMenuOpen, setSurfaceMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const moreRef = useRef(null);
  const surfaceRef = useRef(null);
  const langRef = useRef(null);
  const notifRef = useRef(null);

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (moreRef.current && !moreRef.current.contains(event.target)) setMoreMenuOpen(false);
      if (surfaceRef.current && !surfaceRef.current.contains(event.target)) setSurfaceMenuOpen(false);
      if (langRef.current && !langRef.current.contains(event.target)) setLangMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setNotifMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Citizen Surface Navigation ---
  const citizenPrimaryNav = [
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'report', label: 'Report Incident', icon: PlusCircle },
    { id: 'local-intelligence', label: 'Local Air', icon: Activity },
    { id: 'hotspots', label: 'Hotspots', icon: Flame },
    { id: 'map', label: 'Live Map', icon: MapIcon },
  ];

  const citizenMoreNav = [
    { id: 'about', label: 'About AtmosBridge', icon: Info, desc: 'Civic mission & federated air network' },
    { id: 'datasources', label: 'Data Sources', icon: Database, desc: 'OpenAQ and satellite telemetry inventory' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, desc: 'Language and regional preferences' },
  ];

  // --- Authority Surface Navigation ---
  const authorityPrimaryNav = [
    { id: 'authority', label: 'Command Center', icon: Building2 },
    { id: 'hotspots', label: 'Hotspots', icon: Flame },
    { id: 'predictions', label: 'Forecasting', icon: TrendingUp },
    { id: 'crossborder', label: 'Cross-Border', icon: Globe2 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'map', label: 'Geospatial Map', icon: MapIcon },
  ];

  const authorityMoreNav = [
    { id: 'datasources', label: 'Data Sources Registry', icon: Database, desc: 'Ground sensors & satellite feed contracts' },
    { id: 'about', label: 'Responsible AI & Audit', icon: Info, desc: 'Human-in-the-loop compliance rules' },
    { id: 'settings', label: 'Operations Config', icon: SettingsIcon, desc: 'Alert thresholds & telemetry polling' },
  ];

  const languages = [
    { code: 'en', label: 'English', flag: '🌐' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
  ];

  const currentLangObj = languages.find(l => l.code === language) || languages[0];

  const handleNavClick = (screenId) => {
    navigateTo(screenId);
    setMobileMenuOpen(false);
    setMoreMenuOpen(false);
    setNotifMenuOpen(false);
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const isAuthority = activeRole === 'authority';

  return (
    <>
      {/* Surface Transition Toast Notification */}
      {surfaceToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-modal flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <Sparkles className="w-3.5 h-3.5 text-brand-light animate-pulse" />
          <span>{surfaceToast}</span>
        </div>
      )}

      {/* Dynamic Navbar: Purpose-built for Citizen vs. Authority */}
      <header className={`sticky top-0 z-40 font-sans select-none border-b transition-colors duration-200 ${
        isAuthority 
          ? 'bg-slate-900 text-white border-slate-800 backdrop-blur-md shadow-md' 
          : 'bg-white/95 text-ink border-slate-200 backdrop-blur-md shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* 1. Left: Brand & Surface Identity */}
            <div 
              className="flex items-center gap-3 cursor-pointer flex-shrink-0 group" 
              onClick={() => handleNavClick(isAuthority ? 'authority' : 'landing')}
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/20 shadow-xs flex items-center justify-center bg-brand flex-shrink-0">
                <img 
                  src={logoImg} 
                  alt="AtmosBridge logo" 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`font-extrabold text-base sm:text-lg tracking-tight ${isAuthority ? 'text-white' : 'text-ink'}`}>
                  AtmosBridge
                </span>
                {isAuthority && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-bold hidden sm:inline">|</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-teal-300 font-bold tracking-wider border border-teal-500/30">
                      COMMAND CENTER
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Center: Primary Surface Navigation (Desktop) with Comfortable Spacing */}
            <nav className="hidden xl:flex items-center gap-2">
              {(isAuthority ? authorityPrimaryNav : citizenPrimaryNav).map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                      isAuthority
                        ? isActive 
                          ? 'text-white bg-teal-800/60 font-bold border border-teal-500/40 shadow-xs' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                        : isActive
                          ? 'text-brand bg-brand-surface font-bold border border-brand/20 shadow-xs'
                          : 'text-ink-muted hover:text-ink hover:bg-slate-100/70'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${
                      isActive 
                        ? isAuthority ? 'text-teal-400' : 'text-brand' 
                        : isAuthority ? 'text-slate-400' : 'text-slate-500'
                    }`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* More ▾ Dropdown */}
              <div className="relative" ref={moreRef}>
                <button
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                    isAuthority
                      ? (authorityMoreNav.some(i => i.id === currentScreen) ? 'text-white bg-teal-800/60 font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800/70')
                      : (citizenMoreNav.some(i => i.id === currentScreen) ? 'text-brand bg-brand-surface font-bold' : 'text-ink-muted hover:text-ink hover:bg-slate-100/70')
                  }`}
                  aria-expanded={moreMenuOpen}
                >
                  <span>More</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${moreMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {moreMenuOpen && (
                  <div className={`absolute right-0 mt-2 w-64 rounded-card border shadow-modal p-2 space-y-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
                    isAuthority ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-ink'
                  }`}>
                    <div className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider border-b ${
                      isAuthority ? 'text-slate-400 border-slate-800' : 'text-ink-muted border-slate-100'
                    }`}>
                      {isAuthority ? 'Operations & Governance' : 'About & Mission'}
                    </div>
                    {(isAuthority ? authorityMoreNav : citizenMoreNav).map((sec) => {
                      const SecIcon = sec.icon;
                      const isSecActive = currentScreen === sec.id;
                      return (
                        <button
                          key={sec.id}
                          onClick={() => handleNavClick(sec.id)}
                          className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors text-xs ${
                            isAuthority
                              ? (isSecActive ? 'bg-teal-900/50 text-teal-300 font-semibold' : 'hover:bg-slate-800 text-slate-200')
                              : (isSecActive ? 'bg-brand-surface text-brand font-semibold' : 'hover:bg-slate-50 text-ink')
                          }`}
                        >
                          <SecIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium leading-tight">{sec.label}</div>
                            <div className={`text-[10px] leading-tight mt-0.5 ${isAuthority ? 'text-slate-400' : 'text-ink-muted'}`}>{sec.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </nav>

            {/* 3. Right: Authority Tools / Surface Switcher / Language Controls */}
            <div className="hidden sm:flex items-center gap-2.5 flex-shrink-0">
              
              {/* Authority-specific Refresh Intelligence Button */}
              {isAuthority && (
                <button
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  title="Refresh live incident queue"
                  className="px-2.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal-400' : 'text-teal-400'}`} />
                  <span className="hidden md:inline">Refresh</span>
                </button>
              )}

              {/* Authority Notifications Bell */}
              {isAuthority && (
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifMenuOpen(!notifMenuOpen)}
                    className="relative p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                    title="Priority Alerts"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    {pendingAlertsCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center font-mono animate-pulse">
                        {pendingAlertsCount}
                      </span>
                    )}
                  </button>

                  {notifMenuOpen && (
                    <div className="absolute right-0 mt-2 w-80 rounded-card bg-slate-900 border border-slate-700 text-white shadow-modal p-3 space-y-2 z-50">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Priority Incident Alerts</span>
                        <span className="text-[10px] font-mono bg-rose-900/60 text-rose-300 px-2 py-0.5 rounded-full">
                          {pendingAlertsCount} Pending
                        </span>
                      </div>
                      <div className="space-y-1.5 max-h-60 overflow-y-auto">
                        {alertsList.slice(0, 3).map((al) => (
                          <div 
                            key={al.id}
                            onClick={() => { handleNavClick('alert-details'); }}
                            className="p-2 bg-slate-800 hover:bg-slate-700/80 rounded-md text-xs cursor-pointer space-y-0.5 transition-colors border-l-2 border-l-rose-500"
                          >
                            <div className="font-semibold text-slate-100 truncate">{al.title}</div>
                            <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono">
                              <span>{al.location_name}</span>
                              <span className="text-rose-400 font-bold">Risk {Math.round(al.risk_score)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => handleNavClick('authority')}
                        className="w-full text-center text-xs text-teal-400 hover:text-teal-300 font-semibold pt-1 border-t border-slate-800 flex items-center justify-center gap-1"
                      >
                        <span>Open Incident Queue</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* DUAL-SURFACE SWITCHER DROPDOWN (ONLY CITIZEN & AUTHORITY) */}
              <div className="relative" ref={surfaceRef}>
                <button
                  onClick={() => setSurfaceMenuOpen(!surfaceMenuOpen)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all shadow-xs ${
                    isAuthority
                      ? 'bg-teal-950 hover:bg-teal-900 border-teal-500/50 text-teal-300'
                      : 'bg-surface hover:bg-slate-200/60 border-slate-200 text-ink'
                  }`}
                  aria-label="Switch Active Surface"
                >
                  {isAuthority ? (
                    <Shield className="w-3.5 h-3.5 text-teal-400" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-brand" />
                  )}
                  <span className="capitalize font-bold">{activeRole}</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                {surfaceMenuOpen && (
                  <div className={`absolute right-0 mt-2 w-72 rounded-card border shadow-modal p-2 space-y-1.5 z-50 ${
                    isAuthority ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-ink'
                  }`}>
                    <div className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider border-b ${
                      isAuthority ? 'text-slate-400 border-slate-800' : 'text-ink-muted border-slate-100'
                    }`}>
                      Switch Active Surface
                    </div>

                    {/* Option 1: Citizen */}
                    <button
                      onClick={() => { setActiveRole('citizen'); setSurfaceMenuOpen(false); }}
                      className={`w-full flex items-start justify-between p-2.5 rounded-lg text-left text-xs transition-colors ${
                        activeRole === 'citizen'
                          ? isAuthority ? 'bg-slate-800 text-white' : 'bg-brand/10 text-brand font-semibold'
                          : isAuthority ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-50 text-ink'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-brand" />
                          <span>Citizen Surface</span>
                        </div>
                        <div className={`text-[11px] leading-tight ${isAuthority ? 'text-slate-400' : 'text-ink-muted'}`}>
                          Observe & report environmental events
                        </div>
                      </div>
                      {activeRole === 'citizen' && <Check className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />}
                    </button>

                    {/* Option 2: Authority */}
                    <button
                      onClick={() => { setActiveRole('authority'); setSurfaceMenuOpen(false); }}
                      className={`w-full flex items-start justify-between p-2.5 rounded-lg text-left text-xs transition-colors ${
                        activeRole === 'authority'
                          ? isAuthority ? 'bg-teal-950/80 border border-teal-500/40 text-teal-300 font-semibold' : 'bg-brand/10 text-brand font-semibold'
                          : isAuthority ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-50 text-ink'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-teal-400" />
                          <span>Authority Surface</span>
                        </div>
                        <div className={`text-[11px] leading-tight ${isAuthority ? 'text-slate-400' : 'text-ink-muted'}`}>
                          Monitor, triage & coordinate response
                        </div>
                      </div>
                      {activeRole === 'authority' && <Check className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />}
                    </button>

                    <div className={`px-2 pt-1 text-[10px] leading-relaxed border-t ${
                      isAuthority ? 'text-slate-400 border-slate-800' : 'text-ink-muted border-slate-100'
                    }`}>
                      Your active surface changes the tools and navigation available to you.
                    </div>
                  </div>
                )}
              </div>

              {/* Language Selector */}
              <div className="relative" ref={langRef}>
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className={`px-2.5 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-colors font-mono ${
                    isAuthority
                      ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                      : 'bg-surface hover:bg-slate-200/60 border-slate-200 text-ink'
                  }`}
                >
                  <span>{currentLangObj.flag}</span>
                  <span>{currentLangObj.code.toUpperCase()}</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                {langMenuOpen && (
                  <div className={`absolute right-0 mt-2 w-36 rounded-card border shadow-modal p-1 space-y-0.5 z-50 ${
                    isAuthority ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-ink'
                  }`}>
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { setLanguage(l.code); setLangMenuOpen(false); }}
                        className={`w-full flex items-center justify-between p-1.5 rounded-md text-left text-xs transition-colors ${
                          language === l.code 
                            ? isAuthority ? 'bg-teal-900/50 text-teal-300 font-semibold' : 'bg-brand/10 text-brand font-semibold'
                            : isAuthority ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-50 text-ink'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span>{l.flag}</span>
                          <span>{l.label}</span>
                        </span>
                        {language === l.code && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* 4. Mobile Menu Hamburger Button */}
            <div className="flex xl:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 rounded-lg border transition-colors ${
                  isAuthority 
                    ? 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700' 
                    : 'bg-surface text-ink border-slate-200 hover:bg-slate-200'
                }`}
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer: Mode-Specific */}
        {mobileMenuOpen && (
          <div className={`xl:hidden border-t px-4 py-6 space-y-6 shadow-xl animate-in slide-in-from-top-3 duration-200 ${
            isAuthority ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white/95 backdrop-blur-xl border-slate-200 text-ink'
          }`}>
            
            {/* Primary Modules */}
            <div className="space-y-1">
              <div className={`text-[10px] font-bold uppercase tracking-wider px-2 ${
                isAuthority ? 'text-slate-400' : 'text-ink-muted'
              }`}>
                {isAuthority ? 'Authority Operations' : 'Citizen Intelligence'}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {(isAuthority ? authorityPrimaryNav : citizenPrimaryNav).map((item) => {
                  const Icon = item.icon;
                  const isActive = currentScreen === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-card text-xs font-semibold text-left transition-colors ${
                        isActive 
                          ? isAuthority ? 'bg-teal-700 text-white' : 'bg-brand text-white shadow-xs'
                          : isAuthority ? 'bg-slate-900 text-slate-200 hover:bg-slate-800' : 'bg-surface text-ink hover:bg-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Secondary Utilities */}
            <div className="space-y-1">
              <div className={`text-[10px] font-bold uppercase tracking-wider px-2 ${
                isAuthority ? 'text-slate-400' : 'text-ink-muted'
              }`}>
                Secondary Tools
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                {(isAuthority ? authorityMoreNav : citizenMoreNav).map((sec) => {
                  const SecIcon = sec.icon;
                  const isSecActive = currentScreen === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => handleNavClick(sec.id)}
                      className={`flex items-center gap-2 p-2 rounded-md text-xs text-left transition-colors ${
                        isAuthority
                          ? (isSecActive ? 'bg-teal-900/50 text-teal-300 font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-900')
                          : (isSecActive ? 'bg-brand/10 text-brand font-semibold' : 'text-ink-muted hover:text-ink hover:bg-slate-50')
                      }`}
                    >
                      <SecIcon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{sec.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Surface Switcher & Language Bar (Mobile) */}
            <div className={`pt-3 border-t flex items-center justify-between gap-3 ${
              isAuthority ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-muted font-medium">Surface:</span>
                <select
                  value={activeRole}
                  onChange={(e) => setActiveRole(e.target.value)}
                  className={`text-xs border rounded-md px-2 py-1 font-semibold ${
                    isAuthority ? 'bg-slate-800 border-slate-700 text-teal-300' : 'bg-surface border-slate-200 text-brand'
                  }`}
                >
                  <option value="citizen">👤 Citizen Surface</option>
                  <option value="authority">🛡️ Authority Surface</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-muted font-medium">Lang:</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={`text-xs border rounded-md px-2 py-1 ${
                    isAuthority ? 'bg-slate-800 border-slate-700 text-white' : 'bg-surface border-slate-200 text-ink'
                  }`}
                >
                  {languages.map(l => (
                    <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
                  ))}
                </select>
              </div>
            </div>

          </div>
        )}
      </header>
    </>
  );
}
