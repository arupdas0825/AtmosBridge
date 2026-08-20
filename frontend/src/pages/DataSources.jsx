import React, { useState, useEffect } from 'react';
import { useApp } from '../state/AppContext';
import ProvenanceTag from '../components/common/ProvenanceTag';
import Loader from '../components/common/Loader';
import { getDataSources } from '../lib/api';
import { 
  Database, 
  Radio, 
  Wind, 
  Sparkles, 
  Cpu, 
  FileText, 
  ShieldCheck, 
  ExternalLink,
  Layers
} from 'lucide-react';

export default function DataSources() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getDataSources();
        setSources(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 font-sans">
      
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">Data Sources & Provenance Registry</h1>
          <ProvenanceTag type="observed" size="xs" />
        </div>
        <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
          Full public transparency inventory of all ground, atmospheric, satellite, and AI inference data streams.
        </p>
      </div>

      {/* Provenance Taxonomy Explainer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-surface p-4 space-y-2 border-l-4 border-l-emerald-600">
          <div className="flex items-center gap-2">
            <ProvenanceTag type="observed" size="sm" />
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            Ingested directly from verified live physical station networks (OpenAQ, Open-Meteo).
          </p>
        </div>

        <div className="card-surface p-4 space-y-2 border-l-4 border-l-indigo-600">
          <div className="flex items-center gap-2">
            <ProvenanceTag type="inferred" size="sm" />
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            Derived through Gemini multimodal analysis from citizen photos, audio, and text.
          </p>
        </div>

        <div className="card-surface p-4 space-y-2 border-l-4 border-l-amber-600">
          <div className="flex items-center gap-2">
            <ProvenanceTag type="predicted" size="sm" />
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            Forecasted into future horizons by physics-grounded regression and wind dispersion models.
          </p>
        </div>

        <div className="card-surface p-4 space-y-2 border-l-4 border-l-slate-600">
          <div className="flex items-center gap-2">
            <ProvenanceTag type="simulated" size="sm" />
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            Synthetic micro-sensor grids and satellite aerosol proxies benchmarked for demonstration.
          </p>
        </div>
      </div>

      {/* Full Inventory Table */}
      {loading ? (
        <Loader text="Loading data source registry..." />
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="p-4 bg-surface border-b border-slate-200 font-bold text-xs text-ink uppercase tracking-wider">
            Active Feed Inventory & Governance Contracts
          </div>

          <div className="divide-y divide-slate-200">
            {sources.map((src, idx) => (
              <div key={idx} className="p-5 space-y-2.5 hover:bg-slate-50 transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-ink">{src.name}</h3>
                      <ProvenanceTag type={src.provenance} size="xs" />
                      {src.is_live && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                          LIVE FEED
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-brand font-medium block mt-0.5">Provider: {src.provider}</span>
                  </div>

                  <span className="text-xs font-mono text-ink-muted bg-surface px-2.5 py-1 rounded-md border border-slate-200">
                    Cadence: {src.update_cadence}
                  </span>
                </div>

                <p className="text-xs text-ink-muted leading-relaxed">
                  {src.description}
                </p>

                <div className="text-[11px] text-slate-500 font-mono">
                  Protocol / Schema: <span className="text-ink font-medium">{src.protocol}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
