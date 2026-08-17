import React, { useState } from 'react';
import { useApp } from '../state/AppContext';
import { BRICS_COUNTRIES } from '../lib/constants';
import { 
  Settings as SettingsIcon, 
  Globe2, 
  Bell, 
  RotateCcw, 
  CheckCircle2, 
  ShieldCheck, 
  Info,
  Layers
} from 'lucide-react';

export default function Settings() {
  const { language, setLanguage, activeCountry, setActiveCountry, refreshData } = useApp();
  const [resetSuccess, setResetSuccess] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const handleResetDemo = () => {
    refreshData();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6 font-sans">
      
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">Settings & Preferences</h1>
        <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
          Manage localization, sovereign airshed defaults, and demonstration cache.
        </p>
      </div>

      {/* Language Preferences */}
      <div className="card-surface p-6 space-y-4">
        <h3 className="font-bold text-sm text-ink flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-brand" />
          <span>Interface & Gemini Output Language</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setLanguage('en')}
            className={`p-3.5 rounded-card border text-left space-y-1 transition-all ${
              language === 'en' ? 'border-brand bg-brand-surface shadow-sm' : 'border-slate-200 hover:bg-surface'
            }`}
          >
            <span className="font-bold text-sm text-ink block">English</span>
            <span className="text-xs text-ink-muted block font-mono">Global Standard (EN)</span>
          </button>

          <button
            onClick={() => setLanguage('hi')}
            className={`p-3.5 rounded-card border text-left space-y-1 transition-all ${
              language === 'hi' ? 'border-brand bg-brand-surface shadow-sm' : 'border-slate-200 hover:bg-surface'
            }`}
          >
            <span className="font-bold text-sm text-ink block">हिन्दी</span>
            <span className="text-xs text-ink-muted block">राष्ट्रीय भाषा (HI)</span>
          </button>

          <button
            onClick={() => setLanguage('bn')}
            className={`p-3.5 rounded-card border text-left space-y-1 transition-all ${
              language === 'bn' ? 'border-brand bg-brand-surface shadow-sm' : 'border-slate-200 hover:bg-surface'
            }`}
          >
            <span className="font-bold text-sm text-ink block">বাংলা</span>
            <span className="text-xs text-ink-muted block">আঞ্চলিক ভাষা (BN)</span>
          </button>
        </div>
      </div>

      {/* Sovereign Airshed Defaults */}
      <div className="card-surface p-6 space-y-3">
        <h3 className="font-bold text-sm text-ink flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand" />
          <span>Default Airshed Node (BRICS)</span>
        </h3>

        <select
          value={activeCountry}
          onChange={(e) => setActiveCountry(e.target.value)}
          className="select-control w-full text-sm"
        >
          {BRICS_COUNTRIES.map(c => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.id === 'all' ? 'Multi-National Grid' : c.hub})
            </option>
          ))}
        </select>
      </div>

      {/* Notification Controls */}
      <div className="card-surface p-6 space-y-4">
        <h3 className="font-bold text-sm text-ink flex items-center gap-2">
          <Bell className="w-4 h-4 text-brand" />
          <span>Operational Notifications</span>
        </h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="font-medium text-xs text-ink block">High-Risk Alert Banner Popups</span>
              <span className="text-[11px] text-ink-muted">Show real-time badge counters when a Level 3 or 4 incident is detected.</span>
            </div>
            <input 
              type="checkbox" 
              checked={notifications} 
              onChange={() => setNotifications(!notifications)} 
              className="w-4 h-4 text-brand rounded" 
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer border-t border-slate-100 pt-3">
            <div>
              <span className="font-medium text-xs text-ink block">30-Second Background Telemetry Polling</span>
              <span className="text-[11px] text-ink-muted">Continuously sync latest OpenAQ readings and citizen submissions.</span>
            </div>
            <input 
              type="checkbox" 
              checked={autoRefresh} 
              onChange={() => setAutoRefresh(!autoRefresh)} 
              className="w-4 h-4 text-brand rounded" 
            />
          </label>
        </div>
      </div>

      {/* Demo Reset */}
      <div className="card-surface p-6 space-y-3">
        <h3 className="font-bold text-sm text-ink flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-brand" />
          <span>Demonstration Data State</span>
        </h3>
        <p className="text-xs text-ink-muted leading-relaxed">
          Reset local demonstration state to initial seed datasets (hotspots, sensors, cross-border scenarios).
        </p>

        <button
          onClick={handleResetDemo}
          className="btn-secondary text-xs py-2 px-4"
        >
          {resetSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Data Synced & Reset</span>
            </>
          ) : (
            <span>Reload Seed Data</span>
          )}
        </button>
      </div>

    </div>
  );
}
