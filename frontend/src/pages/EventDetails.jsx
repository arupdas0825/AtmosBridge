import React, { useState, useEffect } from 'react';
import { useApp } from '../state/AppContext';
import SeverityBadge from '../components/common/SeverityBadge';
import ProvenanceTag from '../components/common/ProvenanceTag';
import Loader from '../components/common/Loader';
import { getHotspotById } from '../lib/api';
import { 
  ArrowLeft, 
  MapPin, 
  Wind, 
  Thermometer, 
  Droplets, 
  Users, 
  Radio, 
  TrendingUp, 
  FileText, 
  CheckCircle2, 
  ShieldAlert, 
  ArrowRight,
  Flame,
  Clock,
  Sparkles,
  ShieldCheck,
  Building2,
  Eye,
  Info,
  Database
} from 'lucide-react';

export default function EventDetails() {
  const { activeHotspotId, navigateTo, setActiveAlertId } = useApp();
  const [hotspot, setHotspot] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!activeHotspotId) {
        setLoading(false);
        setHotspot(null);
        return;
      }
      setLoading(true);
      try {
        const data = await getHotspotById(activeHotspotId);
        setHotspot(data);
      } catch (err) {
        console.error(err);
        setHotspot(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeHotspotId]);

  if (loading) return <Loader text="Retrieving hotspot intelligence dossier..." />;
  
  if (!hotspot) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center font-sans space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <Flame className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-ink">Hotspot Dossier Unavailable</h3>
          <p className="text-xs text-ink-muted">The requested hotspot record could not be found or has been resolved.</p>
        </div>
        <button onClick={() => navigateTo('hotspots')} className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Hotspot Catalog</span>
        </button>
      </div>
    );
  }

  const p = hotspot.pollutants || {};
  const w = hotspot.weather || {};
  const pm25 = p.pm25?.value;
  const pm10 = p.pm10?.value;
  const no2 = p.no2?.value;
  const so2 = p.so2?.value;

  const firstDetected = hotspot.first_detected 
    ? new Date(hotspot.first_detected).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })
    : 'Recent';

  const lastUpdated = hotspot.last_updated
    ? new Date(hotspot.last_updated).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })
    : 'Recent';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 font-sans">
      
      {/* 1. Breadcrumb Navigation */}
      <button 
        onClick={() => navigateTo('hotspots')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-dark transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Hotspot Intelligence Catalog</span>
      </button>

      {/* 2. Executive Incident Summary Header */}
      <div className="card-surface p-6 sm:p-7 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <SeverityBadge severity={hotspot.severity} size="sm" />
              <span className="font-mono text-xs text-ink-muted bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                ID: {hotspot.id}
              </span>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200">
                Status: {(hotspot.status || 'Active').toUpperCase()}
              </span>
              <ProvenanceTag type={hotspot.provenance || 'inferred'} size="xs" />
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              {hotspot.title}
            </h1>
            
            <div className="flex items-center gap-3 text-xs text-ink-muted pt-0.5 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand flex-shrink-0" />
                <b>{hotspot.city}, {hotspot.country}</b>
                <span className="font-mono text-slate-500">({hotspot.latitude}, {hotspot.longitude})</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Updated: {lastUpdated}</span>
              </span>
            </div>
          </div>

          <div className="bg-surface p-4 rounded-card border border-slate-200 text-center min-w-[140px] flex-shrink-0 space-y-1">
            <span className="text-[10px] font-bold text-ink-muted block uppercase tracking-wider">
              Hotspot Risk Score
            </span>
            <span className="text-3xl font-extrabold font-mono text-risk-high block">
              {hotspot.risk_score}
            </span>
            <span className="text-[10px] text-ink-muted block font-mono">Scale 0-100</span>
          </div>
        </div>

        {/* Multi-Source Fusion Summary */}
        <div className="border-t border-slate-100 pt-3.5 space-y-2">
          <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Multimodal Event Correlation Summary</span>
          </span>
          <p className="text-sm text-ink leading-relaxed">
            {hotspot.summary}
          </p>
        </div>
      </div>

      {/* 3. Hotspot Score Engine Breakdown */}
      <div className="card-surface p-5 space-y-3 border-l-4 border-l-brand">
        <span className="text-[11px] font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-brand" />
          <span>Hotspot Risk Score Calculation (Prototype Engine)</span>
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-surface p-2.5 rounded border border-slate-200/80 space-y-0.5">
            <span className="text-[10px] font-bold text-ink-muted uppercase block">Sighting Severity (35%)</span>
            <span className="font-semibold text-ink">Severity Level {hotspot.severity}/4</span>
          </div>
          <div className="bg-surface p-2.5 rounded border border-slate-200/80 space-y-0.5">
            <span className="text-[10px] font-bold text-ink-muted uppercase block">Ambient Telemetry (30%)</span>
            <span className="font-semibold text-ink">{pm25 !== undefined ? `${pm25} µg/m³ PM2.5` : 'Baseline Model'}</span>
          </div>
          <div className="bg-surface p-2.5 rounded border border-slate-200/80 space-y-0.5">
            <span className="text-[10px] font-bold text-ink-muted uppercase block">Stagnation / Wind (20%)</span>
            <span className="font-semibold text-ink">{w.wind_speed !== undefined ? `${w.wind_speed} km/h` : 'Calm / Stagnant'}</span>
          </div>
          <div className="bg-surface p-2.5 rounded border border-slate-200/80 space-y-0.5">
            <span className="text-[10px] font-bold text-ink-muted uppercase block">Evidence Clustering (15%)</span>
            <span className="font-semibold text-ink">{hotspot.reports_count || 1} Reported Sighting(s)</span>
          </div>
        </div>
      </div>

      {/* 4. Evidence Matrix: Telemetry vs Meteorological Boundary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Ground Environmental Telemetry */}
        <div className="card-surface p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-ink">
              <Radio className="w-4 h-4 text-sky-600" />
              <span>Ground Air Quality Signals</span>
            </div>
            <ProvenanceTag type="modelled" size="xs" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface p-3 rounded-card border border-slate-200/80">
              <span className="text-[11px] font-semibold text-ink-muted block">PM2.5 Concentration</span>
              {pm25 !== undefined ? (
                <div className="text-lg font-bold font-mono text-risk-high">
                  {pm25} <span className="text-xs font-normal">µg/m³</span>
                </div>
              ) : (
                <div className="text-sm font-mono text-ink-muted">Unmetered</div>
              )}
              <span className="text-[10px] text-ink-muted block mt-0.5">Provenance: {p.pm25?.provenance || 'modelled'}</span>
            </div>

            <div className="bg-surface p-3 rounded-card border border-slate-200/80">
              <span className="text-[11px] font-semibold text-ink-muted block">PM10 Concentration</span>
              {pm10 !== undefined ? (
                <div className="text-lg font-bold font-mono text-ink">
                  {pm10} <span className="text-xs font-normal">µg/m³</span>
                </div>
              ) : (
                <div className="text-sm font-mono text-ink-muted">Unmetered</div>
              )}
              <span className="text-[10px] text-ink-muted block mt-0.5">Provenance: {p.pm10?.provenance || 'modelled'}</span>
            </div>

            {no2 !== undefined && (
              <div className="bg-surface p-3 rounded-card border border-slate-200/80">
                <span className="text-[11px] font-semibold text-ink-muted block">NO₂ Concentration</span>
                <div className="text-lg font-bold font-mono text-ink">
                  {no2} <span className="text-xs font-normal">µg/m³</span>
                </div>
                <span className="text-[10px] text-ink-muted block mt-0.5">Provenance: {p.no2?.provenance || 'modelled'}</span>
              </div>
            )}

            {so2 !== undefined && (
              <div className="bg-surface p-3 rounded-card border border-slate-200/80">
                <span className="text-[11px] font-semibold text-ink-muted block">SO₂ Concentration</span>
                <div className="text-lg font-bold font-mono text-ink">
                  {so2} <span className="text-xs font-normal">µg/m³</span>
                </div>
                <span className="text-[10px] text-ink-muted block mt-0.5">Provenance: {p.so2?.provenance || 'modelled'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Meteorology & Dispersion */}
        <div className="card-surface p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-ink">
              <Wind className="w-4 h-4 text-teal-600" />
              <span>Atmospheric Dispersion Layer</span>
            </div>
            <ProvenanceTag type="modelled" size="xs" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface p-3 rounded-card border border-slate-200/80">
              <span className="text-[11px] font-semibold text-ink-muted block">Wind Speed</span>
              {w.wind_speed !== undefined ? (
                <div className="text-lg font-bold font-mono text-ink">
                  {w.wind_speed} <span className="text-xs font-normal">km/h</span>
                </div>
              ) : (
                <div className="text-sm font-mono text-ink-muted">Data offline</div>
              )}
              <span className="text-[10px] text-teal-700 font-mono block mt-0.5">
                {w.wind_direction !== undefined ? `Vector: ${w.wind_direction}°` : 'Vector offline'}
              </span>
            </div>

            <div className="bg-surface p-3 rounded-card border border-slate-200/80">
              <span className="text-[11px] font-semibold text-ink-muted block">Surface Temperature</span>
              {w.temperature !== undefined ? (
                <div className="text-lg font-bold font-mono text-ink">
                  {w.temperature} <span className="text-xs font-normal">°C</span>
                </div>
              ) : (
                <div className="text-sm font-mono text-ink-muted">Data offline</div>
              )}
              <span className="text-[10px] text-ink-muted block mt-0.5">Planetary boundary layer</span>
            </div>

            <div className="bg-surface p-3 rounded-card border border-slate-200/80">
              <span className="text-[11px] font-semibold text-ink-muted block">Relative Humidity</span>
              {w.humidity !== undefined ? (
                <div className="text-lg font-bold font-mono text-ink">{w.humidity}%</div>
              ) : (
                <div className="text-sm font-mono text-ink-muted">Data offline</div>
              )}
              <span className="text-[10px] text-ink-muted block mt-0.5">Aerosol condensation factor</span>
            </div>

            <div className="bg-surface p-3 rounded-card border border-slate-200/80">
              <span className="text-[11px] font-semibold text-ink-muted block">Estimated Impacted Pop.</span>
              <div className="text-lg font-bold font-mono text-ink">
                {hotspot.affected_population_estimate?.toLocaleString() || 'Localized'}
              </div>
              <span className="text-[10px] text-ink-muted block mt-0.5">Dispersion footprint</span>
            </div>
          </div>
        </div>

      </div>

      {/* 5. Authority Recommended Action & Workflow Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-surface p-6 bg-slate-900 text-white border-slate-800">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand" />
            <h3 className="text-base font-bold">Authority Investigation & Predictive Modeling</h3>
          </div>
          <p className="text-xs text-slate-300">
            Escalate this hotspot into the human-governed Authority queue or compute 24-hour atmospheric dispersion trajectories.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigateTo('authority')}
            className="btn-primary text-xs py-2.5 px-4 shadow-none"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Authority Command Center</span>
          </button>

          <button
            onClick={() => navigateTo('predictions', { hotspotId: hotspot.id })}
            className="btn-secondary text-xs py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white border-slate-700 shadow-none"
          >
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>24h Spike Forecast</span>
          </button>

          {hotspot.cross_border_risk && (
            <button
              onClick={() => navigateTo('crossborder')}
              className="btn-destructive text-xs py-2.5 px-4 shadow-none"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Trans-Boundary Protocol</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
