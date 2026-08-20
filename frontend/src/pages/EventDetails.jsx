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
  Flame
} from 'lucide-react';

export default function EventDetails() {
  const { activeHotspotId, navigateTo } = useApp();
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

  if (loading) return <Loader text="Loading incident dossier..." />;
  if (!hotspot) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center font-sans">
        <p className="text-sm text-ink-muted">Hotspot not found.</p>
        <button onClick={() => navigateTo('hotspots')} className="btn-primary mt-4">
          Return to Hotspots
        </button>
      </div>
    );
  }

  const p = hotspot.pollutants || {};
  const w = hotspot.weather || {};

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 font-sans">
      
      {/* Top Breadcrumb */}
      <button 
        onClick={() => navigateTo('hotspots')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-dark transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Hotspot Catalog</span>
      </button>

      {/* Header Banner */}
      <div className="card-surface p-6 sm:p-7 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <SeverityBadge severity={hotspot.severity} size="sm" />
              <span className="font-mono text-xs text-ink-muted">ID: {hotspot.id}</span>
              <ProvenanceTag type="inferred" size="xs" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">{hotspot.title}</h1>
            <div className="flex items-center gap-2 text-xs text-ink-muted pt-0.5">
              <MapPin className="w-3.5 h-3.5 text-brand flex-shrink-0" />
              <span>{hotspot.city}, {hotspot.country} <span className="font-mono">({hotspot.latitude}, {hotspot.longitude})</span></span>
            </div>
          </div>

          <div className="bg-surface p-4 rounded-card border border-slate-200 text-center min-w-[130px] flex-shrink-0">
            <span className="text-[11px] font-semibold text-ink-muted block uppercase tracking-wider">Risk Score</span>
            <span className="text-3xl font-extrabold font-mono text-risk-high block mt-0.5">{hotspot.risk_score}</span>
            <span className="text-[10px] text-ink-muted block">Out of 100</span>
          </div>
        </div>

        <p className="text-sm text-ink leading-relaxed border-t border-slate-100 pt-3.5">
          {hotspot.summary}
        </p>
      </div>

      {/* Grid: Sensor Telemetry vs Meteorology */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Sensor Telemetry Cluster */}
        <div className="card-surface p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-ink">
              <Radio className="w-4 h-4 text-sky-600" />
              <span>Ground Telemetry Cluster</span>
            </div>
            <ProvenanceTag type="observed" size="xs" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface p-3 rounded-card border border-slate-200/80">
              <span className="text-[11px] font-semibold text-ink-muted block">PM2.5 Sensor</span>
              <div className="text-lg font-bold font-mono text-risk-high">{p.pm25?.value || 192} <span className="text-xs font-normal">µg/m³</span></div>
              <span className="text-[10px] text-ink-muted block mt-0.5">Telemetry: {p.pm25?.provenance || 'observed'}</span>
            </div>

            <div className="bg-surface p-3 rounded-card border border-slate-200/80">
              <span className="text-[11px] font-semibold text-ink-muted block">PM10 Sensor</span>
              <div className="text-lg font-bold font-mono text-ink">{p.pm10?.value || 290} <span className="text-xs font-normal">µg/m³</span></div>
              <span className="text-[10px] text-ink-muted block mt-0.5">Telemetry: {p.pm10?.provenance || 'observed'}</span>
            </div>

            <div className="bg-surface p-3 rounded-card border border-slate-200/80">
              <span className="text-[11px] font-semibold text-ink-muted block">NO2 Concentration</span>
              <div className="text-lg font-bold font-mono text-ink">{p.no2?.value || 45} <span className="text-xs font-normal">ppb</span></div>
              <span className="text-[10px] text-ink-muted block mt-0.5">Telemetry: {p.no2?.provenance || 'simulated'}</span>
            </div>

            <div className="bg-surface p-3 rounded-card border border-slate-200/80">
              <span className="text-[11px] font-semibold text-ink-muted block">Satellite AOD</span>
              <div className="text-lg font-bold font-mono text-indigo-600">{hotspot.satellite_aerosol_index?.value || 0.76}</div>
              <span className="text-[10px] text-ink-muted block mt-0.5">Telemetry: simulated</span>
            </div>
          </div>
        </div>

        {/* Meteorology & Dispersion */}
        <div className="card-surface p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-ink">
              <Wind className="w-4 h-4 text-teal-600" />
              <span>Atmospheric Dispersion</span>
            </div>
            <ProvenanceTag type="observed" size="xs" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface p-3 rounded-card border border-slate-200/80">
              <span className="text-[11px] font-semibold text-ink-muted block">Wind Velocity</span>
              <div className="text-lg font-bold font-mono text-ink">{w.wind_speed || 14.2} <span className="text-xs font-normal">km/h</span></div>
              <span className="text-[10px] text-teal-700 font-mono block mt-0.5">Heading: {w.wind_direction || 115}°</span>
            </div>

            <div className="bg-surface p-3 rounded-card border border-slate-200/80">
              <span className="text-[11px] font-semibold text-ink-muted block">Temperature</span>
              <div className="text-lg font-bold font-mono text-ink">{w.temperature || 29.0} <span className="text-xs font-normal">°C</span></div>
              <span className="text-[10px] text-ink-muted block mt-0.5">Surface ambient</span>
            </div>

            <div className="bg-surface p-3 rounded-card border border-slate-200/80">
              <span className="text-[11px] font-semibold text-ink-muted block">Relative Humidity</span>
              <div className="text-lg font-bold font-mono text-ink">{w.humidity || 55}%</div>
              <span className="text-[10px] text-ink-muted block mt-0.5">Boundary layer index</span>
            </div>

            <div className="bg-surface p-3 rounded-card border border-slate-200/80">
              <span className="text-[11px] font-semibold text-ink-muted block">Affected Population</span>
              <div className="text-lg font-bold font-mono text-ink">{hotspot.affected_population_estimate?.toLocaleString()}</div>
              <span className="text-[10px] text-ink-muted block mt-0.5">Corridor radius</span>
            </div>
          </div>
        </div>

      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-surface p-6 bg-slate-900 text-white border-slate-800">
        <div>
          <h3 className="text-base font-bold">Predictive Action & Regional Escalation</h3>
          <p className="text-xs text-slate-300">Run machine learning spike forecast or review trans-boundary drift model.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigateTo('predictions', { hotspotId: hotspot.id })}
            className="btn-primary text-xs py-2.5 px-4 shadow-none"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Launch Spike Forecast</span>
          </button>

          {hotspot.cross_border_risk && (
            <button
              onClick={() => navigateTo('crossborder')}
              className="btn-destructive text-xs py-2.5 px-4 shadow-none"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Trans-Boundary Advisory</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
