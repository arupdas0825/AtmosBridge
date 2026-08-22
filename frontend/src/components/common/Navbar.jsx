import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../state/AppContext';
import logoImg from '../../assets/logo.jpg';
import { 
  Button, 
  LiquidButton, 
  MetalButton, 
  GlassFilter 
} from '../ui/liquid-glass-button';
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
  ArrowRight,
  Camera,
  Radio
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

  // --- Navigation Arrays ---
  const citizenPrimaryNav = [
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'report', label: 'Report Incident', icon: PlusCircle, isHighlight: true },
    { id: 'local-intelligence', label: 'Local Air', icon: Activity },
    { id: 'hotspots', label: 'Hotspots', icon: Flame },
    { id: 'map', label: 'Live Map', icon: MapIcon },
  ];

  const citizenMoreNav = [
    { id: 'about', label: 'About AtmosBridge', icon: Info, desc: 'Civic mission & federated air network' },
    { id: 'datasources', label: 'Data Sources', icon: Database, desc: 'OpenAQ and satellite telemetry inventory' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, desc: 'Language and regional preferences' },
  ];

  const authorityPrimaryNav = [
    { id: 'authority', label: 'Command Center', icon: Building2, isHighlight: true },
    { id: 'hotspots', label: 'Hotspots', icon: Flame },
    { id: 'predictions', label: 'Forecasting', icon: TrendingUp },
    { id: 'crossborder', label: 'Cross-Border', icon: Globe2 },
    { id: 'map', label: 'Geospatial Map', icon: MapIcon },
  ];

  const authorityMoreNav = [
    { id: 'analytics', label: 'Analytics & Trends', icon: BarChart3, desc: 'Airshed trends & historical comparison' },
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
      <GlassFilter />

      {/* Surface Transition Toast Notification */}
      {surfaceToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 backdrop-blur-xl text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-slate-700/80 animate-in fade-in slide-in-from-top-2 duration-200">
          <Sparkles className="w-3.5 h-3.5 text-teal-300 animate-pulse" />
          <span>{surfaceToast}</span>
        </div>
      )}

      {/* Atmospheric Glass Header Bar */}
      <header className={`sticky top-0 z-40 font-sans select-none transition-all duration-300 border-b backdrop-blur-xl ${
        isAuthority 
          ? 'bg-slate-950/85 text-white border-slate-800/80 shadow-[0_4px_24px_rgba(0,0,0,0.4)]' 
          : 'bg-white/80 text-ink border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
            
            {/* 1. Left: Brand with Liquid Specular Accent */}
            <div 
              className="flex items-center gap-3 cursor-pointer flex-shrink-0 group" 
              onClick={() => handleNavClick(isAuthority ? 'authority' : 'landing')}
            >
              <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-white/30 shadow-md flex items-center justify-center bg-gradient-to-br from-brand to-brand-dark flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                <img 
                  src={logoImg} 
                  alt="AtmosBridge logo" 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
              </div>
              
              <div className="flex items-center">
                <span className={`font-extrabold text-lg tracking-tight leading-none group-hover:text-brand transition-colors ${
                  isAuthority ? 'text-white' : 'text-ink'
                }`}>
                  AtmosBridge
                </span>
              </div>
            </div>

            {/* 2. Center: Desktop Primary Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2">
              {(isAuthority ? authorityPrimaryNav : citizenPrimaryNav).map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;

                // Render prominent CTA using LiquidButton
                if (item.isHighlight) {
                  return (
                    <LiquidButton
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      variant={isAuthority ? "secondary" : "primary"}
                      size="default"
                      className={`font-bold ${
                        isAuthority 
                          ? 'text-teal-300 bg-teal-950 hover:bg-teal-900' 
                          : 'bg-brand hover:bg-brand-dark text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-white" />
                      <span>{item.label}</span>
                    </LiquidButton>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 whitespace-nowrap ${
                      isAuthority
                        ? isActive 
                          ? 'text-white bg-teal-900/60 font-bold border border-teal-500/40 shadow-xs shadow-teal-500/10' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        : isActive
                          ? 'text-brand bg-brand-surface font-bold border border-brand/25 shadow-xs'
                          : 'text-ink-muted hover:text-ink hover:bg-slate-100/80'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${
                      isActive 
                        ? isAuthority ? 'text-teal-300' : 'text-brand' 
                        : isAuthority ? 'text-slate-400' : 'text-slate-500'
                    }`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* More ▾ Dropdown Menu */}
              <div className="relative" ref={moreRef}>
                <button
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap ${
                    isAuthority
                      ? (authorityMoreNav.some(i => i.id === currentScreen) ? 'text-white bg-teal-900/60 font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800/60')
                      : (citizenMoreNav.some(i => i.id === currentScreen) ? 'text-brand bg-brand-surface font-bold' : 'text-ink-muted hover:text-ink hover:bg-slate-100/80')
                  }`}
                  aria-expanded={moreMenuOpen}
                >
                  <span>More</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${moreMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {moreMenuOpen && (
                  <div className={`absolute right-0 mt-2 w-64 rounded-2xl border shadow-2xl p-2 space-y-1 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150 ${
                    isAuthority ? 'bg-slate-900/95 border-slate-700/80 text-white' : 'bg-white/95 border-slate-200 text-ink'
                  }`}>
                    <div className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border-b ${
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
                          className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-colors text-xs ${
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

            {/* 3. Right: Utility Controls (Tactile MetalButton + Liquid Glass) */}
            <div className="hidden sm:flex items-center gap-2.5 flex-shrink-0">
              
              {/* Telemetry Refresh Button */}
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                title="Refresh Live Ground & Satellite Telemetry"
                className={`p-2 rounded-full border transition-all duration-200 hover:scale-105 active:scale-95 ${
                  isAuthority 
                    ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white' 
                    : 'bg-white/80 border-slate-200 text-slate-600 hover:text-brand shadow-xs'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-brand' : ''}`} />
              </button>

              {/* Priority Notifications Bell (Authority Only) */}
              {isAuthority && (
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifMenuOpen(!notifMenuOpen)}
                    className="relative p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                    title="Priority Alerts"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    {pendingAlertsCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center font-mono animate-pulse shadow-sm">
                        {pendingAlertsCount}
                      </span>
                    )}
                  </button>

                  {notifMenuOpen && (
                    <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-950 border border-slate-700 text-white shadow-2xl p-3 space-y-2 z-50 backdrop-blur-2xl">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Priority Incident Alerts</span>
                        <span className="text-[10px] font-mono bg-rose-900/60 text-rose-300 px-2 py-0.5 rounded-full border border-rose-700/50">
                          {pendingAlertsCount} Pending
                        </span>
                      </div>
                      <div className="space-y-1.5 max-h-60 overflow-y-auto">
                        {alertsList.slice(0, 3).map((al) => (
                          <div 
                            key={al.id}
                            onClick={() => { handleNavClick('alert-details'); }}
                            className="p-2 bg-slate-900 hover:bg-slate-800 rounded-lg text-xs cursor-pointer space-y-0.5 transition-colors border-l-2 border-l-rose-500"
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
                        className="w-full text-center text-xs text-teal-300 hover:text-teal-200 font-semibold pt-1 border-t border-slate-800 flex items-center justify-center gap-1"
                      >
                        <span>Open Incident Queue</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Surface Switcher Button with Tactile MetalButton */}
              <div className="relative" ref={surfaceRef}>
                <MetalButton
                  variant={isAuthority ? "primary" : "success"}
                  size="sm"
                  onClick={() => setSurfaceMenuOpen(!surfaceMenuOpen)}
                  title="Switch between Citizen and Authority surface"
                >
                  {isAuthority ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  <span>{isAuthority ? 'Authority' : 'Citizen'}</span>
                  <ChevronDown className="w-3 h-3 opacity-80" />
                </MetalButton>

                {surfaceMenuOpen && (
                  <div className={`absolute right-0 mt-2 w-72 rounded-2xl border shadow-2xl p-2.5 space-y-2 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150 ${
                    isAuthority ? 'bg-slate-900/95 border-slate-700 text-white' : 'bg-white/95 border-slate-200 text-ink'
                  }`}>
                    <div className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider border-b ${
                      isAuthority ? 'text-slate-400 border-slate-800' : 'text-ink-muted border-slate-100'
                    }`}>
                      Switch Active Surface
                    </div>

                    {/* Option 1: Citizen */}
                    <button
                      onClick={() => { setActiveRole('citizen'); setSurfaceMenuOpen(false); }}
                      className={`w-full flex items-start justify-between p-2.5 rounded-xl text-left text-xs transition-colors ${
                        activeRole === 'citizen'
                          ? isAuthority ? 'bg-slate-800 text-white' : 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                          : isAuthority ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-50 text-ink'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Citizen Surface</span>
                        </div>
                        <div className={`text-[11px] leading-tight ${isAuthority ? 'text-slate-400' : 'text-ink-muted'}`}>
                          Observe, verify & report environmental events
                        </div>
                      </div>
                      {activeRole === 'citizen' && <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />}
                    </button>

                    {/* Option 2: Authority */}
                    <button
                      onClick={() => { setActiveRole('authority'); setSurfaceMenuOpen(false); }}
                      className={`w-full flex items-start justify-between p-2.5 rounded-xl text-left text-xs transition-colors ${
                        activeRole === 'authority'
                          ? isAuthority ? 'bg-teal-950 border border-teal-500/50 text-teal-300 font-bold' : 'bg-teal-50 text-teal-800 font-bold border border-teal-200'
                          : isAuthority ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-50 text-ink'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-teal-400" />
                          <span>Authority Surface</span>
                        </div>
                        <div className={`text-[11px] leading-tight ${isAuthority ? 'text-slate-400' : 'text-ink-muted'}`}>
                          Monitor, triage & coordinate municipal response
                        </div>
                      </div>
                      {activeRole === 'authority' && <Check className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Language Selector Glass Pill */}
              <div className="relative" ref={langRef}>
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className={`px-2.5 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all font-mono shadow-xs hover:scale-105 active:scale-95 ${
                    isAuthority
                      ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                      : 'bg-white/80 hover:bg-white border-slate-200 text-ink'
                  }`}
                >
                  <span>{currentLangObj.flag}</span>
                  <span>{currentLangObj.code.toUpperCase()}</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                {langMenuOpen && (
                  <div className={`absolute right-0 mt-2 w-36 rounded-xl border shadow-2xl p-1 space-y-0.5 z-50 backdrop-blur-xl ${
                    isAuthority ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-200 text-ink'
                  }`}>
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { setLanguage(l.code); setLangMenuOpen(false); }}
                        className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left text-xs transition-colors ${
                          language === l.code 
                            ? isAuthority ? 'bg-teal-900/50 text-teal-300 font-bold' : 'bg-brand-surface text-brand font-bold'
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

            {/* 4. Mobile Menu Controls (Header Right on <lg) */}
            <div className="flex lg:hidden items-center gap-2">
              
              {/* Quick Mobile Action Liquid Button */}
              <LiquidButton
                onClick={() => handleNavClick(isAuthority ? 'authority' : 'report')}
                variant={isAuthority ? "secondary" : "primary"}
                size="sm"
                className="font-bold text-[11px] px-3 py-1.5 shadow-sm"
              >
                {isAuthority ? <Building2 className="w-3 h-3 text-teal-300" /> : <Camera className="w-3 h-3" />}
                <span>{isAuthority ? 'Command' : 'Report'}</span>
              </LiquidButton>

              {/* Hamburger Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 rounded-full border transition-all duration-200 hover:scale-105 active:scale-95 ${
                  isAuthority 
                    ? 'bg-slate-900 text-white border-slate-700 hover:bg-slate-800' 
                    : 'bg-white text-ink border-slate-200 hover:bg-slate-100 shadow-xs'
                }`}
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>

          </div>
        </div>

        {/* 5. Mobile Navigation Drawer (Enhanced Liquid Glass Accordion) */}
        {mobileMenuOpen && (
          <div className={`lg:hidden border-t px-4 py-5 space-y-5 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-top-3 duration-200 ${
            isAuthority ? 'bg-slate-950/95 border-slate-800 text-white' : 'bg-white/95 border-slate-200 text-ink'
          }`}>
            
            {/* Primary Modules Grid */}
            <div className="space-y-1.5">
              <div className={`text-[10px] font-bold uppercase tracking-wider px-1 ${
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
                      className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold text-left transition-all duration-200 ${
                        isActive 
                          ? isAuthority 
                            ? 'bg-gradient-to-r from-teal-800 to-teal-700 text-white shadow-md' 
                            : 'bg-gradient-to-r from-brand to-brand-dark text-white shadow-md'
                          : isAuthority 
                            ? 'bg-slate-900/90 text-slate-200 hover:bg-slate-800 border border-slate-800' 
                            : 'bg-slate-50 text-ink hover:bg-slate-100 border border-slate-200/80'
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : (isAuthority ? 'text-teal-400' : 'text-brand')}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Secondary Modules */}
            <div className="space-y-1.5">
              <div className={`text-[10px] font-bold uppercase tracking-wider px-1 ${
                isAuthority ? 'text-slate-400' : 'text-ink-muted'
              }`}>
                Transparency & Governance
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5">
                {(isAuthority ? authorityMoreNav : citizenMoreNav).map((sec) => {
                  const SecIcon = sec.icon;
                  const isSecActive = currentScreen === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => handleNavClick(sec.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg text-xs text-left transition-colors ${
                        isAuthority
                          ? (isSecActive ? 'bg-teal-900/50 text-teal-300 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-900')
                          : (isSecActive ? 'bg-brand-surface text-brand font-semibold' : 'text-ink-muted hover:text-ink hover:bg-slate-50')
                      }`}
                    >
                      <SecIcon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{sec.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Surface & Language Switcher Bar */}
            <div className={`pt-4 border-t flex flex-wrap items-center justify-between gap-3 ${
              isAuthority ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Surface:</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setActiveRole('citizen')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      activeRole === 'citizen'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Citizen
                  </button>
                  <button
                    onClick={() => setActiveRole('authority')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      activeRole === 'authority'
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Authority
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Lang:</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={`text-xs border rounded-xl px-2.5 py-1.5 font-semibold ${
                    isAuthority ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-ink shadow-xs'
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
