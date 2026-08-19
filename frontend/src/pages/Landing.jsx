import React from 'react';
import { useApp } from '../state/AppContext';
import { BRICS_COUNTRIES } from '../lib/constants';
import ProvenanceTag from '../components/common/ProvenanceTag';
import { 
  Sparkles, 
  ArrowRight, 
  Camera, 
  Mic, 
  TrendingUp, 
  Shield, 
  Globe2, 
  Radio,
  Layers,
  CheckCircle2,
  Building2
} from 'lucide-react';

export default function Landing() {
  const { t, navigateTo, setActiveCountry, hotspotsList, pendingAlertsCount } = useApp();

  return (
    <div className="space-y-12 pb-16 font-sans">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-surface/60 via-surface to-surface pt-10 pb-14 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          
          {/* Eyebrow Product Tag */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span>From local sightings to cross-border risk intelligence</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl font-extrabold text-ink tracking-tight leading-tight sm:leading-tight">
            {t.heroTitle || 'Detect Pollution Before It Becomes a Crisis.'}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed">
            {t.heroSubtitle || 'AtmosBridge combines citizen observations, environmental signals, geospatial intelligence, and Google AI to identify hyperlocal pollution events, forecast emerging risks, and help authorities respond faster.'}
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigateTo('report')}
              className="btn-primary text-sm px-6 py-2.5 shadow-md shadow-brand/20"
            >
              <Camera className="w-4 h-4" />
              <span>{t.ctaReport || 'Report Sighting'}</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>

            <button
              onClick={() => navigateTo('voice')}
              className="btn-secondary text-sm px-5 py-2.5"
            >
              <Mic className="w-4 h-4 text-brand" />
              <span>Voice Report (EN / हिन्दी / বাংলা)</span>
            </button>

            <button
              onClick={() => navigateTo('authority')}
              className="btn-secondary text-sm px-5 py-2.5 relative"
            >
              <Shield className="w-4 h-4 text-amber-600" />
              <span>{t.ctaAuthority || 'Authority Portal'}</span>
              {pendingAlertsCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-risk-critical text-white font-bold">
                  {pendingAlertsCount}
                </span>
              )}
            </button>
          </div>

          {/* Environmental Provenance Ribbon (Supporting Weight) */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-ink-muted">
            <span className="text-[11px] font-medium text-slate-500">Data Provenance:</span>
            <ProvenanceTag type="observed" size="xs" />
            <ProvenanceTag type="inferred" size="xs" />
            <ProvenanceTag type="predicted" size="xs" />
            <ProvenanceTag type="simulated" size="xs" />
          </div>

        </div>
      </section>

      {/* Live Operational Metrics Across BRICS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-surface p-4 sm:p-5 text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-brand">5</div>
            <div className="text-xs font-semibold text-ink">Sovereign Airshed Nodes</div>
            <p className="text-[11px] text-ink-muted">India, Brazil, Russia, China, SA</p>
          </div>

          <div className="card-surface p-4 sm:p-5 text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-risk-high">{hotspotsList.length || 6}</div>
            <div className="text-xs font-semibold text-ink">Active Hotspots</div>
            <p className="text-[11px] text-ink-muted">Multi-sensor fused telemetry</p>
          </div>

          <div className="card-surface p-4 sm:p-5 text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-700">100%</div>
            <div className="text-xs font-semibold text-ink">Human-in-the-Loop</div>
            <p className="text-[11px] text-ink-muted">Zero automated penalties</p>
          </div>

          <div className="card-surface p-4 sm:p-5 text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-indigo-600">Gemini AI</div>
            <div className="text-xs font-semibold text-ink">Grounded Multimodal</div>
            <p className="text-[11px] text-ink-muted">Tool-verified environmental facts</p>
          </div>
        </div>
      </section>

      {/* 4-Step Architecture Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-1.5 max-w-2xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-ink">{t.howItWorksTitle || 'How AtmosBridge Works'}</h2>
          <p className="text-xs sm:text-sm text-ink-muted">
            Closing the critical blind spot between localized ground emissions and macro city AQI readings.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="card-surface p-5 space-y-3 hover:border-brand/40 transition-colors">
            <div className="w-8 h-8 rounded-full bg-brand-surface text-brand flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="font-semibold text-sm text-ink">{t.step1Title || 'Citizen Multimodal Intake'}</h3>
            <p className="text-xs text-ink-muted leading-relaxed">{t.step1Desc || 'Citizens upload geo-tagged photos, audio voice notes, or text describing localized burning or smoke plumes.'}</p>
          </div>

          <div className="card-surface p-5 space-y-3 hover:border-brand/40 transition-colors">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="font-semibold text-sm text-ink">{t.step2Title || 'Gemini Multimodal Structuring'}</h3>
            <p className="text-xs text-ink-muted leading-relaxed">{t.step2Desc || 'Google Gemini evaluates visual indicators, estimates severity, and grounds findings using live weather and sensor tools.'}</p>
          </div>

          <div className="card-surface p-5 space-y-3 hover:border-brand/40 transition-colors">
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="font-semibold text-sm text-ink">{t.step3Title || 'Predictive Dispersion Modeling'}</h3>
            <p className="text-xs text-ink-muted leading-relaxed">{t.step3Desc || 'XGBoost atmospheric model forecasts 6h/12h/24h pollution spike trajectories and trans-boundary drift.'}</p>
          </div>

          <div className="card-surface p-5 space-y-3 hover:border-brand/40 transition-colors">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h3 className="font-semibold text-sm text-ink">{t.step4Title || 'Human-in-the-Loop Governance'}</h3>
            <p className="text-xs text-ink-muted leading-relaxed">{t.step4Desc || 'Municipal authorities review ranked incident dossiers, verify evidence, and dispatch targeted mitigation teams.'}</p>
          </div>
        </div>
      </section>

      {/* BRICS Sovereign Airshed Hubs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-ink">{t.bricsTitle || 'BRICS Sovereign Airsheds'}</h2>
            <p className="text-xs text-ink-muted">Regional hubs participating in federated clean-air monitoring and bilateral advisory coordination.</p>
          </div>
          <button onClick={() => navigateTo('map')} className="btn-secondary text-xs py-1.5">
            <span>{t.ctaExploreMap || 'Explore Live Map'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {BRICS_COUNTRIES.filter(c => c.id !== 'all').map(c => (
            <div 
              key={c.id} 
              onClick={() => { setActiveCountry(c.id); navigateTo('map'); }}
              className="card-surface p-4 cursor-pointer hover:border-brand hover:shadow-card transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-ink group-hover:text-brand transition-colors">{c.name}</span>
                <Globe2 className="w-4 h-4 text-ink-muted group-hover:text-brand transition-colors" />
              </div>
              <div className="text-xs text-ink-muted">
                Airshed: <span className="text-ink font-medium">{c.hub}</span>
              </div>
              <div className="pt-1.5 flex items-center justify-between text-[11px] font-semibold text-brand">
                <span>View Airshed</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
