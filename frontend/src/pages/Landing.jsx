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
  Building2,
  Activity,
  MapPin
} from 'lucide-react';

export default function Landing() {
  const { t, navigateTo, setActiveRole, setActiveCountry, hotspotsList, pendingAlertsCount } = useApp();

  return (
    <div className="space-y-12 pb-16 font-sans">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-surface/60 via-surface to-surface pt-10 pb-14 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          
          {/* Eyebrow Product Statement / Micro-line (P1.6) */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span>From local evidence to cross-border risk intelligence.</span>
          </div>

          {/* Main Distinctive Headline (P1.6) */}
          <h1 className="text-3xl sm:text-5xl font-extrabold text-ink tracking-tight leading-tight sm:leading-tight">
            See Pollution Where Conventional Monitoring Misses It.
          </h1>

          {/* Supporting Copy (P1.6) */}
          <p className="text-base sm:text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed">
            AtmosBridge combines citizen observations, environmental data, geospatial intelligence, and Google AI to surface hyperlocal pollution events, assess emerging risks, and support faster, human-led response.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigateTo('report')}
              className="btn-primary text-sm px-6 py-2.5 shadow-md shadow-brand/20"
            >
              <Camera className="w-4 h-4" />
              <span>Report Pollution Sighting</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>

            <button
              onClick={() => { setActiveRole('authority'); navigateTo('authority'); }}
              className="btn-secondary text-sm px-5 py-2.5 relative"
            >
              <Shield className="w-4 h-4 text-amber-600" />
              <span>Open Authority Dashboard</span>
              {pendingAlertsCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-risk-critical text-white font-bold">
                  {pendingAlertsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => navigateTo('voice')}
              className="btn-secondary text-sm px-4 py-2.5"
            >
              <Mic className="w-4 h-4 text-brand" />
              <span>Voice Report</span>
            </button>
          </div>

          {/* Environmental Provenance Ribbon */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-ink-muted">
            <span className="text-[11px] font-medium text-slate-500">Data Provenance:</span>
            <ProvenanceTag type="observed" size="xs" />
            <ProvenanceTag type="modelled" size="xs" />
            <ProvenanceTag type="inferred" size="xs" />
            <ProvenanceTag type="predicted" size="xs" />
          </div>

        </div>
      </section>

      {/* Operational Metrics (Audited & Labeled) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-surface p-4 sm:p-5 text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-brand">5</div>
            <div className="text-xs font-semibold text-ink">Founding Airshed Nodes</div>
            <p className="text-[11px] text-ink-muted">India, Brazil, Russia, China, SA</p>
          </div>

          <div className="card-surface p-4 sm:p-5 text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-risk-high">{hotspotsList.length}</div>
            <div className="text-xs font-semibold text-ink">Active Airshed Clusters</div>
            <p className="text-[11px] text-ink-muted">Telemetry mesh nodes</p>
          </div>

          <div className="card-surface p-4 sm:p-5 text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-700">100%</div>
            <div className="text-xs font-semibold text-ink">Human-in-the-Loop</div>
            <p className="text-[11px] text-ink-muted">Officer-verified decisions</p>
          </div>

          <div className="card-surface p-4 sm:p-5 text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-indigo-600">Gemini AI</div>
            <div className="text-xs font-semibold text-ink">Grounded Multimodal</div>
            <p className="text-[11px] text-ink-muted">Structured telemetry extraction</p>
          </div>
        </div>
      </section>

      {/* 4-Step Architecture Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-1 max-w-2xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-extrabold text-ink">How AtmosBridge Works</h2>
          <p className="text-xs sm:text-sm text-ink-muted">
            A unified loop connecting citizen evidence with official municipal response.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-surface p-5 space-y-2 border-t-2 border-t-brand">
            <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-mono font-bold text-xs">
              01
            </div>
            <h3 className="text-sm font-bold text-ink">Citizen Observation</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Citizens submit geo-tagged photos and voice sightings in local languages without requiring sensor hardware.
            </p>
          </div>

          <div className="card-surface p-5 space-y-2 border-t-2 border-t-indigo-600">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-mono font-bold text-xs">
              02
            </div>
            <h3 className="text-sm font-bold text-ink">Multimodal Gemini AI</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Google Gemini processes multimodal evidence, extracts emission signatures, and cross-references nearby station data.
            </p>
          </div>

          <div className="card-surface p-5 space-y-2 border-t-2 border-t-amber-600">
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-mono font-bold text-xs">
              03
            </div>
            <h3 className="text-sm font-bold text-ink">Atmospheric Dispersion</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Physics-grounded models evaluate wind trajectories and boundary layer stagnation to forecast 6h/12h/24h spike risks.
            </p>
          </div>

          <div className="card-surface p-5 space-y-2 border-t-2 border-t-emerald-600">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-mono font-bold text-xs">
              04
            </div>
            <h3 className="text-sm font-bold text-ink">Authority Triage</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Environmental officers review structured dossiers, dispatch field inspectors, and maintain an auditable response log.
            </p>
          </div>
        </div>
      </section>

      {/* Sovereign Airshed Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl font-extrabold text-ink">BRICS Airshed Intelligence Hubs</h2>
            <p className="text-xs text-ink-muted">Explore monitored environmental clusters across founding member nations.</p>
          </div>
          <button 
            onClick={() => navigateTo('map')} 
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
          >
            <span>Open Interactive Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {BRICS_COUNTRIES.filter(c => c.id !== 'all').map((country) => (
            <div
              key={country.id}
              onClick={() => { setActiveCountry(country.id); navigateTo('map'); }}
              className="card-surface p-4 hover:border-brand cursor-pointer transition-all hover:shadow-card group space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-ink group-hover:text-brand transition-colors">
                  {country.name}
                </span>
                <MapPin className="w-3.5 h-3.5 text-ink-muted group-hover:text-brand" />
              </div>
              <div className="text-[11px] text-ink-muted font-medium">
                {country.hub}
              </div>
              <div className="text-[10px] text-brand font-semibold flex items-center gap-1">
                <span>View Airshed Map</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
