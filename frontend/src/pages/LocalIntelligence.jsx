import React from 'react';
import { useApp } from '../state/AppContext';
import ProvenanceTag from '../components/common/ProvenanceTag';
import SeverityBadge from '../components/common/SeverityBadge';
import { 
  HeartHandshake, 
  Wind, 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  Home, 
  Baby, 
  ArrowRight,
  TrendingDown,
  Info
} from 'lucide-react';

export default function LocalIntelligence() {
  const { t, navigateTo } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 font-sans">
      
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">{t.localTitle || 'Hyperlocal Air Quality Intelligence'}</h1>
          <ProvenanceTag type="observed" size="xs" />
        </div>
        <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
          {t.localSubtitle || 'Micro-sensor telemetry cross-referenced with WHO air quality thresholds and personalized safety guidance.'}
        </p>
      </div>

      {/* Main AQI Summary Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <div className="card-surface p-6 flex flex-col justify-between bg-gradient-to-br from-white to-red-50/30 border-red-200/60 space-y-4">
          <div>
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">{t.currentAqi || 'Current Local AQI'}</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-5xl font-extrabold font-mono text-risk-high">248</span>
              <span className="text-xs font-mono font-medium text-ink-muted">AQI</span>
            </div>
            <div className="mt-2.5">
              <SeverityBadge severity={4} size="sm" />
            </div>
          </div>

          <div className="text-[11px] text-ink-muted border-t border-slate-200/80 pt-3 space-y-1">
            <div className="flex justify-between">
              <span>Station:</span>
              <span className="text-ink font-medium">Okhla C-Block Monitor</span>
            </div>
            <div className="flex justify-between">
              <span>Telemetry:</span>
              <span className="text-emerald-700 font-mono font-semibold">Live OpenAQ</span>
            </div>
          </div>
        </div>

        {/* Pollutants Breakdown */}
        <div className="md:col-span-2 card-surface p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-ink">Ground Chemical Composition</h3>
            <ProvenanceTag type="observed" size="xs" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-surface p-3 rounded-card border border-slate-200/80">
              <span className="text-[11px] font-semibold text-ink-muted block">PM2.5</span>
              <span className="text-lg font-bold font-mono text-risk-critical">248.0</span>
              <span className="text-[10px] text-ink-muted block font-mono">µg/m³ (WHO: 15)</span>
            </div>
            <div className="bg-surface p-3 rounded-card border border-slate-200/80">
              <span className="text-[11px] font-semibold text-ink-muted block">PM10</span>
              <span className="text-lg font-bold font-mono text-risk-high">385.0</span>
              <span className="text-[10px] text-ink-muted block font-mono">µg/m³ (WHO: 45)</span>
            </div>
            <div className="bg-surface p-3 rounded-card border border-slate-200/80">
              <span className="text-[11px] font-semibold text-ink-muted block">NO2</span>
              <span className="text-lg font-bold font-mono text-risk-watch">78.0</span>
              <span className="text-[10px] text-ink-muted block font-mono">ppb (Moderate)</span>
            </div>
            <div className="bg-surface p-3 rounded-card border border-slate-200/80">
              <span className="text-[11px] font-semibold text-ink-muted block">SO2</span>
              <span className="text-lg font-bold font-mono text-risk-safe">24.0</span>
              <span className="text-[10px] text-ink-muted block font-mono">ppb (Safe)</span>
            </div>
          </div>

          <p className="text-xs text-ink-muted leading-relaxed">
            Fine particulate matter (PM2.5) is currently <b className="text-ink">16.5×</b> above WHO guidelines due to surface-level industrial combustion and low wind dispersion.
          </p>
        </div>

      </div>

      {/* Public Health Protective Advisories */}
      <div className="card-surface p-6 space-y-4">
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-brand" />
          <h2 className="text-base font-bold text-ink">{t.healthAdvisoryTitle || 'Community Health Protective Advisories'}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface p-4 rounded-card border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
              😷
            </div>
            <h4 className="font-semibold text-xs text-ink">{t.maskAdvisory || 'N95 Respirator Advisory'}</h4>
            <p className="text-[11px] text-ink-muted leading-relaxed">
              Standard surgical masks do not filter fine PM2.5 particles. Wear certified N95 or KN95 respirators outdoors.
            </p>
          </div>

          <div className="bg-surface p-4 rounded-card border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm">
              🚸
            </div>
            <h4 className="font-semibold text-xs text-ink">{t.childrenAdvisory || 'Sensitive Groups & Schools'}</h4>
            <p className="text-[11px] text-ink-muted leading-relaxed">
              Schools in a 3km radius should suspend outdoor sports and recess activities until afternoon dispersion improves.
            </p>
          </div>

          <div className="bg-surface p-4 rounded-card border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              🏠
            </div>
            <h4 className="font-semibold text-xs text-ink">{t.indoorAdvisory || 'Indoor Ventilation'}</h4>
            <p className="text-[11px] text-ink-muted leading-relaxed">
              Seal door thresholds and operate HEPA filtration. Natural ventilation is recommended only during wind peaks (13:00 - 15:00).
            </p>
          </div>
        </div>

        {/* Disclaimer per PRD §13 */}
        <div className="bg-slate-50 p-3 rounded-md text-[11px] text-ink-muted border border-slate-200 flex items-start gap-2">
          <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <p>
            <b>Public Health Disclaimer:</b> AtmosBridge provides community environmental intelligence derived from public air quality telemetry and dispersion models. This does not constitute individualized clinical medical advice.
          </p>
        </div>
      </div>

    </div>
  );
}
