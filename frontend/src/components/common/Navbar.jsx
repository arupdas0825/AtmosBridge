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
  Check,
  Building2
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
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const moreRef = useRef(null);
  const roleRef = useRef(null);
  const langRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (moreRef.current && !moreRef.current.contains(event.target)) setMoreMenuOpen(false);
      if (roleRef.current && !roleRef.current.contains(event.target)) setRoleMenuOpen(false);
      if (langRef.current && !langRef.current.contains(event.target)) setLangMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Primary Navigation Items
  const primaryNavItems = [
    { id: 'map', label: 'BRICS Map', icon: MapIcon },
    { id: 'report', label: 'Report Incident', icon: PlusCircle },
    { id: 'hotspots', label: 'Hotspots', icon: Flame },
    { id: 'predictions', label: 'Forecasting', icon: TrendingUp },
    { id: 'crossborder', label: 'Cross-Border', icon: Globe2 },
    { id: 'authority', label: 'Authority', icon: Bell, badge: pendingAlertsCount },
  ];

  // Secondary "More" Items (NO DUPLICATES of primary nav items)
  const secondaryNavItems = [
    { id: 'landing', label: 'Overview & Mission', icon: Sparkles, desc: 'Public portal & federated intelligence' },
    { id: 'local-intelligence', label: 'Local Air Intelligence', icon: Activity, desc: 'Hyperlocal AQI & health guidance' },
    { id: 'analytics', label: 'Analytics & Trends', icon: BarChart3, desc: 'Historical telemetry & spatial trends' },
    { id: 'datasources', label: 'Data Sources', icon: Database, desc: 'Telemetry provenance registry' },
    { id: 'about', label: 'Responsible AI', icon: Info, desc: 'Governance principles & audit trail' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, desc: 'Airshed & interface preferences' },
  ];

  const roles = [
    { id: 'citizen', label: 'Citizen', desc: 'Observe & submit sightings' },
    { id: 'authority', label: 'Authority', desc: 'Triage & dispatch response' },
    { id: 'analyst', label: 'Analyst', desc: 'Meteorology & ML forecasting' },
    { id: 'coordinator', label: 'Coordinator', desc: 'Bilateral cross-border protocol' },
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
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 font-sans select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* 1. Left: Logo & Wordmark (No BRICS AI badge) */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer flex-shrink-0 group" 
            onClick={() => handleNavClick('landing')}
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shadow-xs flex items-center justify-center bg-brand flex-shrink-0 group-hover:border-brand transition-colors">
              <img 
                src={logoImg} 
                alt="AtmosBridge logo" 
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-ink tracking-tight">AtmosBridge</span>
            </div>
          </div>

          {/* 2. Center: Primary Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                    isActive 
                      ? 'text-brand bg-brand-surface font-bold border border-brand/20 shadow-xs' 
                      : 'text-ink-muted hover:text-ink hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-risk-critical text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* More ▾ Dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                  secondaryNavItems.some(i => i.id === currentScreen)
                    ? 'text-brand bg-brand-surface font-bold border border-brand/20'
                    : 'text-ink-muted hover:text-ink hover:bg-slate-100/70'
                }`}
                aria-expanded={moreMenuOpen}
              >
                <span>More</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${moreMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Secondary Navigation Dropdown */}
              {moreMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-card bg-white border border-slate-200 shadow-modal p-2 space-y-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-2 py-1 text-[10px] font-bold text-ink-muted uppercase tracking-wider border-b border-slate-100">
                    Secondary Tools & Mission
                  </div>
                  {secondaryNavItems.map((sec) => {
                    const SecIcon = sec.icon;
                    const isSecActive = currentScreen === sec.id;
                    return (
                      <button
                        key={sec.id}
                        onClick={() => handleNavClick(sec.id)}
                        className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors text-xs ${
                          isSecActive ? 'bg-brand-surface text-brand font-semibold' : 'hover:bg-slate-50 text-ink'
                        }`}
                      >
                        <SecIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isSecActive ? 'text-brand' : 'text-slate-500'}`} />
                        <div>
                          <div className="font-medium leading-tight">{sec.label}</div>
                          <div className="text-[10px] text-ink-muted leading-tight mt-0.5">{sec.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* 3. Right: User Role & Language Controls */}
          <div className="hidden sm:flex items-center gap-2">
            
            {/* Role Switcher Pill */}
            <div className="relative" ref={roleRef}>
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="px-2.5 py-1 rounded-full text-xs font-semibold bg-surface hover:bg-slate-200/60 border border-slate-200 text-ink flex items-center gap-1.5 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-brand" />
                <span className="capitalize">{activeRole}</span>
                <ChevronDown className="w-3 h-3 text-ink-muted" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-card bg-white border border-slate-200 shadow-modal p-1.5 space-y-1 z-50">
                  <div className="px-2 py-1 text-[10px] font-bold text-ink-muted uppercase tracking-wider border-b border-slate-100">
                    Switch Active Persona
                  </div>
                  {roles.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => { setActiveRole(r.id); setRoleMenuOpen(false); }}
                      className={`w-full flex items-center justify-between p-2 rounded-md text-left text-xs transition-colors ${
                        activeRole === r.id ? 'bg-brand/10 text-brand font-semibold' : 'hover:bg-slate-50 text-ink'
                      }`}
                    >
                      <div>
                        <div className="capitalize">{r.label}</div>
                        <div className="text-[10px] text-ink-muted">{r.desc}</div>
                      </div>
                      {activeRole === r.id && <Check className="w-3.5 h-3.5 text-brand flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language Selector */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="px-2.5 py-1 rounded-full text-xs font-semibold bg-surface hover:bg-slate-200/60 border border-slate-200 text-ink flex items-center gap-1.5 transition-colors font-mono"
              >
                <span>{currentLangObj.flag}</span>
                <span>{currentLangObj.code.toUpperCase()}</span>
                <ChevronDown className="w-3 h-3 text-ink-muted" />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-36 rounded-card bg-white border border-slate-200 shadow-modal p-1 space-y-0.5 z-50">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLanguage(l.code); setLangMenuOpen(false); }}
                      className={`w-full flex items-center justify-between p-1.5 rounded-md text-left text-xs transition-colors ${
                        language === l.code ? 'bg-brand/10 text-brand font-semibold' : 'hover:bg-slate-50 text-ink'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>{l.flag}</span>
                        <span>{l.label}</span>
                      </span>
                      {language === l.code && <Check className="w-3 h-3 text-brand" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* 4. Mobile Menu Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-surface text-ink hover:bg-slate-200 border border-slate-200 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Slide-down Navigation Sheet */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl px-4 py-6 space-y-6 shadow-xl animate-in slide-in-from-top-3 duration-200">
          
          {/* Primary Modules */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-ink-muted uppercase tracking-wider px-2">
              Primary Intelligence
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-card text-xs font-semibold text-left transition-colors ${
                      isActive ? 'bg-brand text-white shadow-xs' : 'bg-surface text-ink hover:bg-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {item.badge > 0 && (
                      <span className="ml-auto px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-mono">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secondary Utilities */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-ink-muted uppercase tracking-wider px-2">
              Secondary Tools & Settings
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
              {secondaryNavItems.map((sec) => {
                const SecIcon = sec.icon;
                const isSecActive = currentScreen === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => handleNavClick(sec.id)}
                    className={`flex items-center gap-2 p-2 rounded-md text-xs text-left transition-colors ${
                      isSecActive ? 'bg-brand/10 text-brand font-semibold' : 'text-ink-muted hover:text-ink hover:bg-slate-50'
                    }`}
                  >
                    <SecIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{sec.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Persona & Language Bar */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-muted font-medium">Role:</span>
              <select
                value={activeRole}
                onChange={(e) => setActiveRole(e.target.value)}
                className="text-xs bg-surface border border-slate-200 rounded-md px-2 py-1 text-ink capitalize"
              >
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-muted font-medium">Lang:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="text-xs bg-surface border border-slate-200 rounded-md px-2 py-1 text-ink"
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
  );
}
